/*
  This is your site JavaScript code - you can add interactivity!
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello 🌎");

/* 
Make the "Click me!" button move when the visitor clicks it:
- First add the button to the page by following the steps in the TODO 🚧
*/
const btn = document.querySelector("button"); // Get the button from the page
if (btn) { // Detect clicks on the button
  btn.onclick = function () {
    // The 'dipped' class in style.css changes the appearance on click
    btn.classList.toggle("dipped");
  };
}


// ----- GLITCH STARTER PROJECT HELPER CODE -----

// Open file when the link in the preview is clicked
let goto = (file, line) => {
  window.parent.postMessage(
    { type: "glitch/go-to-line", payload: { filePath: file, line: line } }, "*"
  );
};
// Get the file opening button from its class name
const filer = document.querySelectorAll(".fileopener");
filer.forEach((f) => {
  f.onclick = () => { goto(f.dataset.file, f.dataset.line); };
});


// ----- HOME MENU BUTTONS (p5.js) -----
// Concept: a projector casting three circles of light on a wall.
// Each button uses light.png cut into a circle by a mask.
const MENU_LIGHT_IMG = "sources/light.png?v=2";
// offsetY: how far the circle sits below the top row, relative to circle size (0.5 = half a circle)
// effect: "dandelion" -> dandelions float across the background while hovered (dandelion.js)
// anim: image sequence inside the circle: shows the first frame, loops while hovered
//   folder: where the frames are, named 0001.webp, 0002.webp, ... (see MENU_ANIM_* below)
//   count: number of frames (0 = no animation), fps: playback speed
// cue: when this button's animation reaches cue.frame (counted from 0), the buttons with
//   cueCurve start playing their animations and draw a looping curve out of their side
//   (1 = out of the right side, -1 = out of the left side). The curves are pulled back
//   when this animation finishes (or the mouse leaves).
// squeeze: true -> a small light ball squeezes out of the top while hovered; it can be dragged
//   (mouse: hold and drag, touch: press and drag). On touch screens it is always out.
const MENU_ITEMS = [
  {
    label: "Interactive Media Projects",
    href: "Pages/p1_interactive_p.html",
    offsetY: 0.5,
    effect: "dandelion",
    anim: { folder: "sources/anim/p1/", count: 46, fps: 60 },
    cueCurve: 1,
  },
  {
    label: "Professional Projects",
    href: "Pages/p6_professional_Projects_p.html",
    offsetY: 0,
    anim: { folder: "sources/anim/p6/", count: 66, fps: 60 },
    cue: { frame: 44 },
  },
  {
    label: "Game Projects",
    href: "Pages/p2_game_p.html",
    offsetY: 0.5,
    anim: { folder: "sources/anim/p2/", count: 137, fps: 60 },
    cueCurve: -1,
    squeeze: true,
  },
];
const MENU_ANIM_EXT = "webp"; // frame file type: "webp", "png" or "jpg"
const MENU_ANIM_DIGITS = 4; // 4 -> 0001, 0002, ...
const MENU_ANIM_START = 1; // number of the first frame
const MENU_ANIM_VERSION = "1"; // bump when you replace the frames, so browsers reload them

// Cue curves (see "cue" above): a thick, rough-edged line with one loop, randomized each time
const CUE_COLOR = [249, 225, 170];
const CUE_WIDTH = 0.11; // thickness relative to the circle size
const CUE_GROW_TIME = 0.45; // seconds to draw the curve out
const CUE_RETRACT_TIME = 0.35; // seconds to pull it back in
const CUE_START = 0.7; // starts inside the circle (relative to its radius), so it comes out from behind
const CUE_ROUGHNESS = 0.15; // how bumpy the edge is
const CUE_END_INSET = 0.9; // ends just inside the edge of the "cue" (middle) circle, relative to its radius
const CUE_END_SPREAD = 35; // random end point on the middle circle's side: +/- this many degrees
const CUE_IN_FRONT = false; // true: curves pass in front of the middle circle, false: behind all circles
const CUE_SPACING = 0.006; // distance between the dots that make up the line (relative to the curve's length)

const MENU_MOBILE_WIDTH = 600; // stack buttons vertically below this width
const MENU_MAX_SIZE = 440; // max circle diameter at scale 1 (px)
const MENU_SIZE_RATIO = 1.1; // circle size relative to its cell width (row layout)
const MENU_SIZE_RATIO_MOBILE = 0.95; // circle size relative to screen width (stacked layout)
const MENU_MASK_RATIO = 0.92; // mask circle size relative to the image (trims rough edges)

const MENU_IDLE_SCALE_MIN = 0.9; // a: idle "breathing" scale range a ~ b
const MENU_IDLE_SCALE_MAX = 1.0; // b
const MENU_HOVER_SCALE = 1.2; // c: scale when the mouse is on the button
const MENU_PRESS_SCALE = 1.1; // scale while pressed
const MENU_BREATH_SPEED = 0.02; // speed of the a ~ b breathing
const MENU_DRIFT = 8; // max drift up/down/left/right (px)
const MENU_DRIFT_SPEED = 0.004; // speed of the drift

const MENU_LABEL_GAP = 16; // space between the largest circle and its label
const MENU_GLOW_IDLE = 0.15; // glow blur relative to circle size
const MENU_GLOW_HOVER = 0.35;
const MENU_GLOW_PAD = 0.3; // empty space above/below for the glow, relative to circle size
const MENU_LABEL_HEIGHT = 40;
const MENU_TEXT_COLOR = [255, 241, 214];
const MENU_GLOW_COLOR = "rgba(255, 226, 160, 0.6)";

// light.png as a plain <img>: drawn with a circular clip instead of p5's loadImage/mask,
// so it also works when index.html is opened directly from disk (file://)
const menuLight = new Image();
let menuLightReady = false;
menuLight.onload = () => (menuLightReady = true);
menuLight.onerror = () => console.warn("Menu image not found: " + MENU_LIGHT_IMG);
menuLight.src = MENU_LIGHT_IMG;

// Load an image sequence as plain <img>s (in the background, not blocking the page)
function loadAnimFrames(anim) {
  if (!anim || anim.count <= 0) return [];
  return Array.from({ length: anim.count }, (_, i) => {
    const img = new Image();
    const num = String(MENU_ANIM_START + i).padStart(MENU_ANIM_DIGITS, "0");
    img.src = `${anim.folder}${num}.${MENU_ANIM_EXT}?v=${MENU_ANIM_VERSION}`;
    return img;
  });
}

function isImageReady(img) {
  return img && img.complete && img.naturalWidth > 0;
}

// Squeeze-out small light ball (see "squeeze" above)
const SQUEEZE_SIZE = 0.05; // small ball radius relative to the big ball's radius
const SQUEEZE_GAP = 0.35; // gap between the balls when it is out, relative to the big radius
const SQUEEZE_STAY = 0.6; // seconds it stays out after the pointer leaves
const SQUEEZE_SPRING = 0.12; // pull back toward its spot (higher = snappier)
const SQUEEZE_DAMPING = 0.78; // lower = less bouncy
const SQUEEZE_RETURN_SPRING = 0.02; // slower pull when flying home after being let go (releases dandelions on the way)
const SQUEEZE_RETURN_DAMPING = 0.9;
const SQUEEZE_RETURN_MAX_SPEED = 25; // px per frame on the way home (lower = slower trip, longer trail)
const SQUEEZE_HINT = "hold & drag";
const IS_TOUCH = window.matchMedia("(hover: none)").matches; // phones / tablets

const blob = {
  owner: null, // the button it squeezes out of
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  r: 0,
  visible: false,
  out: false,
  dragging: false,
  returning: false, // flying back home after being let go
  dragged: false, // dragged at least once since it popped out
  suppressClick: false, // don't treat the end of a drag as a click on a button
  lastWant: -1e9,
  hint: 0, // hint text opacity 0 ~ 1
};

let cueOn = false;
let menuButtons = [];
let menuCanvas = null; // the <canvas> element
let menuFocusIndex = -1; // button focused by keyboard (Tab)

function setup() {
  const holder = document.getElementById("menu-canvas");
  menuCanvas = createCanvas(holder.clientWidth, 10).parent(holder).elt;
  textFont("Coming Soon");

  menuButtons = MENU_ITEMS.map((item, i) => ({
    ...item,
    seed: i * 100, // different noise per button so they move independently
    frames: loadAnimFrames(item.anim),
    animStart: 0,
    cueStart: 0, // when the cue started this button's animation
    cuePlaying: false,
    curve: null, // current cue curve points
    curveEndUp: 0, // where on the middle circle's side the curve ends (radians, + = higher)
    curveProgress: 0, // 0 = hidden, 1 = fully drawn
    scale: MENU_IDLE_SCALE_MAX,
    hover: 0,
    x: 0, y: 0, // current (drifting) position
    homeX: 0, homeY: 0, // resting position
    size: 0,
    labelY: 0,
  }));

  blob.owner = menuButtons.find((b) => b.squeeze) || null;

  // Keep the plain links for keyboard / screen readers, but hide them visually
  const fallback = document.getElementById("menu-fallback");
  fallback.classList.add("visually-hidden");
  fallback.querySelectorAll("a").forEach((a, i) => {
    a.addEventListener("focus", () => (menuFocusIndex = i));
    a.addEventListener("blur", () => (menuFocusIndex = -1));
  });

  layoutMenu();

  // Re-layout whenever the holder's width changes (window resize, scrollbar appearing, ...)
  new ResizeObserver(() => {
    if (holder.clientWidth !== width) layoutMenu();
  }).observe(holder);
}

// Size the canvas and place the buttons in a row (or a column on mobile).
// Each cell reserves room for the biggest circle plus drift, so the label is never covered.
function layoutMenu() {
  const holder = document.getElementById("menu-canvas");
  const w = holder.clientWidth;
  const stacked = w < MENU_MOBILE_WIDTH;
  const cols = stacked ? 1 : menuButtons.length;
  const cellW = w / cols;
  const maxScale = max(MENU_HOVER_SCALE, MENU_IDLE_SCALE_MAX);
  const ratio = stacked ? MENU_SIZE_RATIO_MOBILE : MENU_SIZE_RATIO;
  const size = min(((cellW - MENU_DRIFT * 2) / maxScale) * ratio, MENU_MAX_SIZE);
  const circleAreaH = size * maxScale + MENU_DRIFT * 2;
  const cellH = circleAreaH + MENU_LABEL_GAP + MENU_LABEL_HEIGHT;
  const glowPad = size * maxScale * MENU_GLOW_PAD; // keeps the glow from being cut off
  // Staggered heights only in the row layout
  const offsets = menuButtons.map((b) => (stacked ? 0 : b.offsetY * size));
  const maxOffset = max(offsets);

  // Glow space above and below. The bottom space is pulled back with a negative margin,
  // so the glow can spill over the footer without adding empty space to the page.
  resizeCanvas(w, (stacked ? cellH * menuButtons.length : cellH + maxOffset) + glowPad * 2);
  holder.style.marginBottom = `${-glowPad}px`;

  menuButtons.forEach((b, i) => {
    const col = stacked ? 0 : i;
    const row = stacked ? i : 0;
    b.size = size;
    b.homeX = cellW * col + cellW / 2;
    b.homeY = glowPad + cellH * row + offsets[i] + circleAreaH / 2;
    b.x = b.homeX;
    b.y = b.homeY;
    b.labelY = glowPad + cellH * row + offsets[i] + circleAreaH + MENU_LABEL_GAP;
  });
}

function isOverButton(b) {
  return dist(mouseX, mouseY, b.x, b.y) < (b.size * b.scale) / 2;
}

function getHoveredButton() {
  if (blob.dragging || isOverBlob(mouseX, mouseY)) return null; // the small ball takes priority
  return menuButtons.find(isOverButton) || null;
}

function draw() {
  clear();
  const hovered = getHoveredButton();
  if (blob.dragging) cursor("grabbing");
  else if (isOverBlob(mouseX, mouseY)) cursor("grab");
  else cursor(hovered ? HAND : ARROW);

  menuButtons.forEach((b, i) => {
    const active = b === hovered || i === menuFocusIndex;
    if (active && !b.active) b.animStart = millis(); // restart the animation on each hover
    b.active = active;

    // Idle: breathe between a ~ b. Hover: grow to c.
    const breath = (sin(frameCount * MENU_BREATH_SPEED + b.seed) + 1) / 2;
    let target = lerp(MENU_IDLE_SCALE_MIN, MENU_IDLE_SCALE_MAX, breath);
    if (active) target = mouseIsPressed && b === hovered ? MENU_PRESS_SCALE : MENU_HOVER_SCALE;
    b.scale = lerp(b.scale, target, 0.12);
    b.hover = lerp(b.hover, active ? 1 : 0, 0.12);

    // Gentle drift around the resting position (calms down while hovered)
    const t = frameCount * MENU_DRIFT_SPEED;
    const drift = MENU_DRIFT * (1 - b.hover);
    b.x = b.homeX + (noise(b.seed, t) - 0.5) * 2 * drift;
    b.y = b.homeY + (noise(b.seed + 50, t) - 0.5) * 2 * drift;
  });

  updateCue();
  updateBlob(hovered);
  // While squeezing out it is behind its ball; once out (or dragged) it is in front
  const blobBehind =
    blob.visible &&
    !blob.dragging &&
    dist(blob.x, blob.y, blob.owner.x, blob.owner.y) < (blob.owner.size * blob.owner.scale * MENU_MASK_RATIO) / 2;

  // The curves always come out from behind their own circle;
  // CUE_IN_FRONT decides whether they pass in front of or behind the other circles
  const curveOwners = menuButtons.filter((b) => b.cueCurve);
  const others = menuButtons.filter((b) => !b.cueCurve);
  if (CUE_IN_FRONT) others.forEach(drawMenuButton);
  const cueSrc = menuButtons.find((b) => b.cue);
  if (cueSrc) curveOwners.forEach((b) => drawCueCurve(b, cueSrc));
  if (!CUE_IN_FRONT) others.forEach(drawMenuButton);
  if (blobBehind) drawBlob();
  curveOwners.forEach(drawMenuButton);
  menuButtons.forEach(drawMenuLabel);
  if (blob.visible && !blobBehind) drawBlob();

  // Dandelions float out from around the "dandelion" circle while it is active
  const dandelionBtn = menuButtons.find((b) => b.effect === "dandelion");
  if (dandelionBtn && typeof dandelionBg !== "undefined") {
    const r = menuCanvas.getBoundingClientRect(); // dandelion canvas uses viewport coordinates
    const radius = ((dandelionBtn.size * dandelionBtn.scale) / 2) * MENU_MASK_RATIO;
    dandelionBg.setEmitter(r.left + dandelionBtn.x, r.top + dandelionBtn.y, radius);
    dandelionBg.setActive(dandelionBtn.active);
  }

  // The dragged small light ball gathers dandelions and releases them when let go
  if (blob.owner && typeof dandelionBg !== "undefined") {
    const r = menuCanvas.getBoundingClientRect();
    dandelionBg.setGatherer(r.left + blob.x, r.top + blob.y, blob.r, blob.vx, blob.vy, blob.dragging, blob.visible);
  }
}

function drawMenuButton(b) {
  const d = b.size * b.scale;
  const r = (d * MENU_MASK_RATIO) / 2; // radius of the visible circle
  const ctx = drawingContext;

  // Soft glow around the light, stronger on hover (also the fallback if light.png is missing)
  push();
  ctx.shadowColor = MENU_GLOW_COLOR;
  ctx.shadowBlur = d * lerp(MENU_GLOW_IDLE, MENU_GLOW_HOVER, b.hover);
  noStroke();
  fill(255, 236, 194);
  circle(b.x, b.y, r * 2);
  pop();

  if (menuLightReady) drawInCircle(menuLight, b.x, b.y, d, r, 1);

  // Image sequence on top of the light, inside the same circular mask
  const frame = getAnimFrame(b);
  if (frame) drawInCircle(frame, b.x, b.y, d, r, 1);
}

// Draw an image as a centered square crop, clipped to a circle (the circular mask)
function drawInCircle(img, x, y, d, r, alpha) {
  const ctx = drawingContext;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const side = min(w, h);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.clip();
  ctx.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, x - d / 2, y - d / 2, d, d);
  ctx.restore();
}

// Current frame: the first frame when idle, looping while hovered
// (falls back to an earlier frame if it hasn't loaded yet)
function getAnimFrame(b) {
  if (b.frames.length === 0) return null;
  const n = b.frames.length;
  let index = 0;
  if (b.active) index = animFramesSince(b, b.animStart) % n;
  else if (b.cuePlaying) index = animFramesSince(b, b.cueStart) % n;
  for (let k = 0; k < n; k++) {
    const img = b.frames[(index - k + n) % n];
    if (isImageReady(img)) return img;
  }
  return null;
}

// Labels stay fixed; only their brightness changes on hover
function drawMenuLabel(b) {
  noStroke();
  fill(...MENU_TEXT_COLOR, 180 + 75 * b.hover);
  textAlign(CENTER, TOP);
  textSize(16);
  text(b.label, b.homeX, b.labelY);
}

function mouseClicked() {
  if (blob.suppressClick) {
    blob.suppressClick = false;
    return;
  }
  const b = getHoveredButton();
  if (b) window.location.href = b.href;
}

// Frames played since the given start time (not wrapped)
function animFramesSince(b, start) {
  return floor(((millis() - start) / 1000) * b.anim.fps);
}

// The "cue" button's animation drives the curves and animations of the "cueCurve" buttons
function updateCue() {
  const src = menuButtons.find((b) => b.cue && b.frames.length > 0);
  if (!src) return;
  const frame = src.active ? animFramesSince(src, src.animStart) % src.frames.length : -1;
  const on = frame >= src.cue.frame; // turns off when the animation wraps around (finished) or the mouse leaves
  const dt = deltaTime / 1000;

  menuButtons.forEach((b) => {
    if (!b.cueCurve) return;
    if (on && !cueOn) {
      // New random curve each time (if the old one is still pulling back, it just grows out again)
      if (b.curveProgress <= 0) {
        b.curveEndUp = radians(random(-CUE_END_SPREAD, CUE_END_SPREAD));
        const { sx, sy, ex, ey } = cueEnds(b, src);
        b.curve = makeCueCurve(dist(sx, sy, ex, ey) / (b.size * b.scale));
      }
      if (!b.cuePlaying) b.cueStart = millis();
    }
    b.curveProgress = on
      ? min(1, b.curveProgress + dt / CUE_GROW_TIME)
      : max(0, b.curveProgress - dt / CUE_RETRACT_TIME);
    b.cuePlaying = on || b.curveProgress > 0; // keep playing until the curve is pulled back
  });
  cueOn = on;
}

// Start point (inside the curve owner's circle) and end point (on the side of the target circle)
function cueEnds(b, target) {
  const dir = b.cueCurve;
  const r = ((b.size * b.scale * MENU_MASK_RATIO) / 2) * CUE_START;
  const tr = ((target.size * target.scale * MENU_MASK_RATIO) / 2) * CUE_END_INSET;
  // left owner ends on the target's left side, right owner on its right side (curveEndUp > 0 = higher)
  const a = dir === 1 ? PI + b.curveEndUp : -b.curveEndUp;
  return { sx: b.x + dir * r, sy: b.y, ex: target.x + cos(a) * tr, ey: target.y + sin(a) * tr };
}

// Random looping curve from (0, 0) to (1, 0): straight start -> one loop (prolate cycloid) -> rising tail.
// chordInD: start-to-end distance in circle-size units, so the loop keeps a similar size on screen.
function makeCueCurve(chordInD) {
  const loopR = random(0.13, 0.18); // loop size
  const loopStep = loopR * random(0.35, 0.5); // smaller = rounder, tighter loop
  const entry = random(0.15, 0.25); // straight part before the loop (first part is hidden behind the circle)
  const loopEnd = entry + loopStep * TWO_PI;
  const tail = max(0.1, chordInD * random(0.9, 1.1) - loopEnd);
  const rise = random(0.5, 1.5) / tail; // tail bends upward

  const raw = [];
  for (let x = 0; x < entry; x += 0.01) raw.push([x, 0]);
  for (let t = -PI; t <= PI; t += PI / 60) {
    raw.push([entry + loopStep * (t + PI) - loopR * sin(t), -loopR * (1 + cos(t))]);
  }
  for (let u = 0.01; u <= tail; u += 0.01) raw.push([loopEnd + u, -rise * u * u * 0.3]);

  // Normalize so the curve goes from (0, 0) to (1, 0); the drawing code rotates/scales it to the real end points
  const [endX, endY] = raw[raw.length - 1];
  const len = Math.hypot(endX, endY);
  const ang = -atan2(endY, endX);
  const norm = raw.map(([x, y]) => [(x * cos(ang) - y * sin(ang)) / len, (x * sin(ang) + y * cos(ang)) / len]);

  // Resample at even spacing and give each dot a slightly different size for a rough edge
  const seed = random(1000);
  const pts = [];
  let carry = 0;
  for (let i = 1; i < norm.length; i++) {
    const [x0, y0] = norm[i - 1];
    const [x1, y1] = norm[i];
    const segLen = dist(x0, y0, x1, y1);
    for (let d = carry; d < segLen; d += CUE_SPACING) {
      // slow wobble in thickness + small random bumps = rough, hand-painted edge
      const k = 1 + CUE_ROUGHNESS * ((noise(pts.length * 0.08, seed) - 0.5) * 2 + random(-0.7, 0.7));
      pts.push({ x: lerp(x0, x1, d / segLen), y: lerp(y0, y1, d / segLen), k });
    }
    carry = (carry - segLen) % CUE_SPACING;
    if (carry < 0) carry += CUE_SPACING;
  }
  return pts;
}

function drawCueCurve(b, target) {
  if (!b.curve || b.curveProgress <= 0) return;
  const dir = b.cueCurve;
  const { sx, sy, ex, ey } = cueEnds(b, target);
  // Map the normalized curve onto start -> end (y flipped for the right side, so the loop still goes up)
  const len = dist(sx, sy, ex, ey);
  const ang = atan2(ey - sy, ex - sx);
  const ca = cos(ang);
  const sa = sin(ang);
  const eased = 1 - pow(1 - b.curveProgress, 3); // fast start, soft finish
  const count = floor(eased * b.curve.length);
  const w = CUE_WIDTH * b.size * b.scale;

  noStroke();
  fill(...CUE_COLOR);
  for (let i = 0; i < count; i++) {
    const p = b.curve[i];
    const lx = p.x * len;
    const ly = p.y * len * dir;
    circle(sx + lx * ca - ly * sa, sy + lx * sa + ly * ca, w * p.k);
  }
}

// ----- Squeeze-out small light ball -----

function isOverBlob(x, y) {
  return blob.visible && dist(x, y, blob.x, blob.y) < blob.r * 1.4; // a bit bigger, easier to grab by finger
}

// Where the small ball rests: above its ball when out, inside it (hidden) when not
function blobHome(out) {
  const o = blob.owner;
  const R = (o.size * o.scale * MENU_MASK_RATIO) / 2;
  if (!out) return { x: o.x, y: o.y - R * 0.4 };
  return { x: o.x, y: o.y - R - R * SQUEEZE_GAP - blob.r };
}

function updateBlob(hovered) {
  const o = blob.owner;
  if (!o) return;
  blob.r = ((o.size * MENU_MASK_RATIO) / 2) * SQUEEZE_SIZE;

  // Once out, it stays out until it has been dragged; after that it goes back in when the pointer leaves
  const stayOut = blob.visible && !blob.dragged;
  const want = IS_TOUCH || stayOut || hovered === o || blob.dragging || blob.returning || isOverBlob(mouseX, mouseY);
  if (want) blob.lastWant = millis();
  blob.out = millis() - blob.lastWant < SQUEEZE_STAY * 1000;

  if (blob.out && !blob.visible) {
    // start squeezing out from inside the big ball
    const h = blobHome(false);
    Object.assign(blob, { x: h.x, y: h.y, vx: 0, vy: 0, visible: true });
  }
  if (!blob.visible) return;

  if (blob.dragging) {
    // follow the pointer (slightly smoothed), stay inside the canvas
    const tx = constrain(mouseX, blob.r, width - blob.r);
    const ty = constrain(mouseY, blob.r, height - blob.r);
    const nx = lerp(blob.x, tx, 0.45);
    const ny = lerp(blob.y, ty, 0.45);
    blob.vx = nx - blob.x;
    blob.vy = ny - blob.y;
    blob.x = nx;
    blob.y = ny;
  } else {
    // spring back to its spot (bouncy "squeeze" when it pops out or is let go)
    const h = blobHome(blob.out);
    if (blob.returning && dist(blob.x, blob.y, h.x, h.y) < blob.r) blob.returning = false;
    const k = blob.returning ? SQUEEZE_RETURN_SPRING : SQUEEZE_SPRING;
    const damp = blob.returning ? SQUEEZE_RETURN_DAMPING : SQUEEZE_DAMPING;
    blob.vx = (blob.vx + (h.x - blob.x) * k) * damp;
    blob.vy = (blob.vy + (h.y - blob.y) * k) * damp;
    const speed = Math.hypot(blob.vx, blob.vy);
    if (blob.returning && speed > SQUEEZE_RETURN_MAX_SPEED) {
      blob.vx *= SQUEEZE_RETURN_MAX_SPEED / speed;
      blob.vy *= SQUEEZE_RETURN_MAX_SPEED / speed;
    }
    blob.x += blob.vx;
    blob.y += blob.vy;
    if (!blob.out && dist(blob.x, blob.y, h.x, h.y) < 1 && Math.hypot(blob.vx, blob.vy) < 0.5) {
      blob.visible = false; // fully back inside
      blob.dragged = false; // next time it pops out, it stays out again
    }
  }
  blob.hint = lerp(blob.hint, blob.out && !blob.dragging ? 1 : 0, 0.1);
}

function drawBlob() {
  // Stretch along the movement direction = squishy feel
  const speed = Math.hypot(blob.vx, blob.vy);
  const stretch = min(0.35, speed * 0.03);
  const d = (blob.r * 2) / MENU_MASK_RATIO;
  const ctx = drawingContext;

  push();
  translate(blob.x, blob.y);
  rotate(atan2(blob.vy, blob.vx));
  scale(1 + stretch, 1 - stretch * 0.6);
  // glow
  push();
  ctx.shadowColor = MENU_GLOW_COLOR;
  ctx.shadowBlur = d * (blob.dragging ? 0.6 : 0.4);
  noStroke();
  fill(255, 236, 194);
  circle(0, 0, blob.r * 2);
  pop();
  if (menuLightReady) drawInCircle(menuLight, 0, 0, d, blob.r, 1);
  pop();

  // "hold & drag" hint above the small ball, gently pulsing
  if (blob.hint > 0.01) {
    noStroke();
    fill(...MENU_TEXT_COLOR, blob.hint * (170 + 60 * sin(millis() * 0.004)));
    textAlign(CENTER, BOTTOM);
    textSize(14);
    textStyle(NORMAL);
    text(SQUEEZE_HINT, blob.x, blob.y - blob.r - 10);
  }
}

function startBlobDrag() {
  blob.dragging = true;
  blob.dragged = true;
  blob.returning = false;
}

function endBlobDrag() {
  if (!blob.dragging) return false;
  blob.dragging = false;
  blob.returning = true;
  blob.suppressClick = true;
  return true;
}

// Mouse
function mousePressed() {
  blob.suppressClick = false;
  if (isOverBlob(mouseX, mouseY)) startBlobDrag();
}

function mouseReleased() {
  endBlobDrag();
}

// Touch: only block scrolling when the touch is on the small ball, so taps and scrolling still work
function touchStarted() {
  if (isOverBlob(mouseX, mouseY)) {
    startBlobDrag();
    return false;
  }
}

function touchMoved() {
  if (blob.dragging) return false;
}

function touchEnded() {
  if (endBlobDrag()) return false;
}
