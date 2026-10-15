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
const MENU_ITEMS = [
  // effect: "dandelion" -> dandelions float across the background while hovered (dandelion.js)
  { label: "Interactive Media Projects", href: "Pages/p1_interactive_p.html", offsetY: 0.5, effect: "dandelion" },
  { label: "Professional Projects", href: "Pages/p6_professional_Projects_p.html", offsetY: 0 },
  { label: "Game Projects", href: "Pages/p2_game_p.html", offsetY: 0.5 },
];

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
const MENU_GLOW_PAD = 0.2; // empty space above/below for the glow, relative to circle size
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
    scale: MENU_IDLE_SCALE_MAX,
    hover: 0,
    x: 0, y: 0, // current (drifting) position
    homeX: 0, homeY: 0, // resting position
    size: 0,
    labelY: 0,
  }));

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
  const w = document.getElementById("menu-canvas").clientWidth;
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

  // Glow space on top only; below the labels there is nothing to cut off
  resizeCanvas(w, (stacked ? cellH * menuButtons.length : cellH + maxOffset) + glowPad);

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
  return menuButtons.find(isOverButton) || null;
}

function draw() {
  clear();
  const hovered = getHoveredButton();
  cursor(hovered ? HAND : ARROW);

  menuButtons.forEach((b, i) => {
    const active = b === hovered || i === menuFocusIndex;
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

    drawMenuButton(b);
    drawMenuLabel(b);
  });

  // Dandelions float out from around the "dandelion" circle while it is active
  const dandelionBtn = menuButtons.find((b) => b.effect === "dandelion");
  if (dandelionBtn && typeof dandelionBg !== "undefined") {
    const r = menuCanvas.getBoundingClientRect(); // dandelion canvas uses viewport coordinates
    const radius = ((dandelionBtn.size * dandelionBtn.scale) / 2) * MENU_MASK_RATIO;
    dandelionBg.setEmitter(r.left + dandelionBtn.x, r.top + dandelionBtn.y, radius);
    dandelionBg.setActive(dandelionBtn.active);
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

  if (!menuLightReady) return;

  // light.png: centered square crop, clipped to a circle (the circular mask)
  const w = menuLight.naturalWidth;
  const h = menuLight.naturalHeight;
  const side = min(w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(b.x, b.y, r, 0, TWO_PI);
  ctx.clip();
  ctx.drawImage(menuLight, (w - side) / 2, (h - side) / 2, side, side, b.x - d / 2, b.y - d / 2, d, d);
  ctx.restore();
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
  const b = getHoveredButton();
  if (b) window.location.href = b.href;
}
