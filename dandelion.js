/*
  Home page background: dandelion particles (ported from the Processing sketch).
  - While the Interactive circle is hovered, dandelions are released from inside
    the circle (hidden behind it) and float out around it, with gusts of upward wind.
  - When the mouse leaves, no new ones are released, but the existing ones keep
    drifting in the background until they leave the screen.
  The serial sensor input is replaced by the hover state and the constants below.

  Uses p5.js instance mode so it gets its own full-screen canvas,
  separate from the menu sketch in script.js.
  dandelionBg.setEmitter(x, y, radius) - circle position in viewport pixels
  dandelionBg.setActive(true / false)  - start / stop emitting
*/
const dandelionBg = (() => {
  const STEPS_PER_SECOND = 10; // the original ran ~10 steps/s (delay(100)); drawing is interpolated
  const MAX_PARTICLES = 250; // when exceeded, the oldest ones fade out
  const MAX_EXTRA_SCALE = 0.3; // replaces the sensor value d2d3d (original: 0 ~ 0.5)
  const WIND_CHANCE = 0.15; // chance per step that a gust starts while active
  const WIND_STEPS = 3; // how long a gust lasts (steps)

  const EMIT_PER_STEP = 1; // new dandelions per step while hovered
  const EMIT_RADIUS = 0.6; // spawn distance from the center, relative to the circle radius (hidden behind it)
  const OUT_SPEED_MIN = 1.5; // initial outward speed (px/step)
  const OUT_SPEED_MAX = 4;
  const OUT_PUSH = 0.3; // outward push during the first steps, to get out from behind the circle
  const OUT_PUSH_STEPS = 15;
  const MAX_SPEED = 3; // drift speed after leaving the circle (px/step) so they float gently in the background
  const SLOW_DOWN = 0.9; // how quickly they slow down to MAX_SPEED
  const OFFSCREEN_MARGIN = 60; // removed once this far outside the screen
  const FADE_STEP = 0.05; // fade-out speed when there are too many

  // Dandelion shape
  const D_SCALE = 1.2;
  const STEM = 1.2;
  const CIRCLE_D = 2.4;
  const COLORS = [
    [138, 244, 255], // blue
    [255, 252, 138], // yellow
    [255, 102, 102], // red
    [162, 230, 164], // green
    [250, 197, 250], // purple
  ];

  let active = false;
  let instance = null;
  const emitter = { x: 0, y: 0, r: 0 };

  const sketch = (p) => {
    let particles = [];
    let stepTimer = 0;
    let windLeft = 0;

    // Same odds as the original dice roll (lineNum 2 never happens there either)
    function pickLineNum() {
      const dice = Math.floor(p.random(1, 21));
      if (dice <= 6) return 1;
      if (dice <= 12) return 3;
      if (dice <= 19) return 4;
      return 5;
    }

    class Particle {
      constructor() {
        // Start inside the circle at a random angle, moving outward
        this.dir = p5.Vector.random2D();
        this.position = p
          .createVector(emitter.x, emitter.y)
          .add(p5.Vector.mult(this.dir, emitter.r * EMIT_RADIUS));
        this.prevPosition = this.position.copy();
        this.velocity = p5.Vector.mult(this.dir, p.random(OUT_SPEED_MIN, OUT_SPEED_MAX));
        this.velocity.add(p.random(-1, 1), p.random(-1, 1));
        this.age = 0;
        this.alpha = 1;
        this.fading = false;
        this.rotation = p.random(-180, 180);
        this.prevRotation = this.rotation;
        this.roA = p.random(-15, 15);
        this.lineNum = pickLineNum();
        this.colors = Array.from({ length: this.lineNum }, () => p.random(COLORS));
        this.scale = 0;
        this.addScale = 0;
        this.scaleStep = 0;
        this.setScale();
      }

      setScale() {
        this.scale = MAX_EXTRA_SCALE !== 0 ? p.random(-0.2, MAX_EXTRA_SCALE) : 0;
        this.scale = Math.min(this.scale, 0.5);
        this.scaleStep = (this.scale - this.addScale) / 30;
      }

      update(wind) {
        // Size breathing
        if (this.scale > 0) {
          this.addScale += this.scaleStep;
          if (this.addScale >= this.scale) {
            this.scale *= -1;
            this.scaleStep = (this.scale - this.addScale) / 60;
          }
        } else if (this.scale < 0) {
          this.addScale += this.scaleStep;
          if (this.addScale <= this.scale) {
            this.scale *= -1;
            this.scaleStep = (this.scale - this.addScale) / 60;
          }
        }

        const acc = p.createVector(p.random(-0.8, 0.8), p.random(-0.8, 0.8));
        if (this.age < OUT_PUSH_STEPS) acc.add(p5.Vector.mult(this.dir, OUT_PUSH));
        if (wind) acc.y = p.random(-0.8, -0.5);

        this.prevPosition.set(this.position);
        this.prevRotation = this.rotation;
        this.velocity.add(acc);
        // Fast while getting out from behind the circle, then ease down to a gentle drift
        if (this.age >= OUT_PUSH_STEPS && this.velocity.mag() > MAX_SPEED) this.velocity.mult(SLOW_DOWN);
        this.position.add(this.velocity);
        this.rotation += this.roA;
        this.age++;
        if (this.fading) this.alpha -= FADE_STEP;
      }

      isDead() {
        const { x, y } = this.position;
        const m = OFFSCREEN_MARGIN;
        const offScreen = x < -m || y < -m || x > p.width + m || y > p.height + m;
        return offScreen || this.alpha <= 0;
      }

      // t: 0 ~ 1, how far we are between the previous and current step
      display(t) {
        const x = p.lerp(this.prevPosition.x, this.position.x, t);
        const y = p.lerp(this.prevPosition.y, this.position.y, t);
        const rot = p.lerp(this.prevRotation, this.rotation, t);
        const a = 255 * Math.max(this.alpha, 0);

        p.push();
        p.noStroke();
        p.translate(x, y);
        p.rotate(p.radians(rot));
        p.scale(D_SCALE + this.addScale);
        for (let i = 1; i <= this.lineNum; i++) {
          p.fill(255, a);
          p.rotate(p.radians(20));
          if (i <= Math.floor(this.lineNum / 2)) {
            p.arc(0, 0, STEM, 40, p.PI / 10, p.PI / 2);
          } else {
            p.arc(0, 0, STEM, 40, p.PI / 2, p.PI);
          }
          p.fill(...this.colors[i - 1], a);
          p.circle(0, 20, CIRCLE_D);
        }
        p.pop();
      }
    }

    // One step of the original sketch's draw()
    function step() {
      if (active && windLeft <= 0 && p.random() < WIND_CHANCE) windLeft = WIND_STEPS;
      const wind = windLeft > 0;
      if (windLeft > 0) windLeft--;

      if (active) {
        for (let k = 0; k < EMIT_PER_STEP; k++) particles.push(new Particle());
      }

      // Too many: let the oldest ones fade out
      const extra = particles.filter((pt) => !pt.fading).length - MAX_PARTICLES;
      for (let i = 0, n = 0; n < extra && i < particles.length; i++) {
        if (!particles[i].fading) {
          particles[i].fading = true;
          n++;
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.update(wind);
        if (pt.isDead()) particles.splice(i, 1);
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).id("dandelion-bg");
      p.noLoop(); // sleep until the circle is hovered
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
      const stepDur = 1 / STEPS_PER_SECOND;
      stepTimer += p.deltaTime / 1000;
      let steps = 0;
      while (stepTimer >= stepDur && steps < 5) {
        step();
        stepTimer -= stepDur;
        steps++;
      }
      if (steps === 5) stepTimer = 0; // tab was in the background: don't catch up

      p.clear();
      const t = stepTimer / stepDur;
      particles.forEach((pt) => pt.display(t));

      // Nothing left to animate: stop the loop to save CPU
      if (!active && particles.length === 0) p.noLoop();
    };
  };

  instance = new p5(sketch);

  return {
    setEmitter(x, y, r) {
      emitter.x = x;
      emitter.y = y;
      emitter.r = r;
    },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (on) instance.loop();
    },
  };
})();
