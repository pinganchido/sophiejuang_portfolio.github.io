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
//scrolling
window.addEventListener("scroll", function () {
  const scrollY = window.scrollY;
  const i1 = document.getElementById("i1").offsetTop;
  const i2 = document.getElementById("i2").offsetTop;
  const i3 = document.getElementById("i3").offsetTop;
  const wrapper = document.querySelector(".wrapper");
  
  if (scrollY >= i3 ) {
    document.body.style.backgroundColor = "lightcoral";
    wrapper.style.backgroundColor = "lightcoral";
  } else if (scrollY >= i2) {
    document.body.style.backgroundColor = "lightblue";
    wrapper.style.backgroundColor = "lightblue";
  } else {
    document.body.style.backgroundColor = "#F0FFF0"	;
     wrapper.style.backgroundColor = "#F0FFF0";
  }
});

// Get the section element

const i2_oriCol = "lightblue";
// Define colors and index
const bgColors = ["#f0f8ff", "#ffcccb", "#d1e7dd", "#fff3cd", "#dbeafe"];
let bgIndex = 0;

//get video
const glight_video = document.getElementById("glight_video");
//get i2 part
const i2_section = document.getElementById("i2");
const wrapper = document.querySelector(".wrapper");

// Listen for key press
document.addEventListener("click", () => {
  const scrollY = window.scrollY;
  const i2Top = document.getElementById("i2").offsetTop;
  const i2Bottom = i2Top + document.getElementById("i2").offsetHeight;
  


  if (scrollY >= i2Top && scrollY < i2Bottom) {
    wrapper.style.backgroundColor = bgColors[bgIndex];
    bgIndex = (bgIndex + 1) % bgColors.length;
  } else {
    wrapper.style.backgroundColor = "#ff0000"; // Remove background override
  }
});

glight_video.addEventListener("timeUpdate", () => {
    const currTime = glight_video.currentTime;

    if(currTime >= 60 && currTime < 120)//seconds
    {
        i2_section.style.backgroundColor = "#ff0000";
    }
    else if (currTime >= 120) {
    i2_section.style.backgroundColor = "#0000ff";
     
  } else {
    i2_section.style.backgroundColor = "#00ff00"; // or any default
  }


   
} );

//section 1 leaves
let leaves = [];

function setup() {
  //let canvas = createCanvas(windowWidth, windowHeight);
  const section = document.getElementById('sketch-holder');
  let canvas = createCanvas(section.offsetWidth, section.offsetHeight);
  canvas.parent('sketch-holder');
  canvas.style('position', 'absolute');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '-1'); // Optional: put behind text
  clear(); // ensure it's transparent
}

function draw() {
 clear(); // translucent white for trailing effect

  for (let i = leaves.length - 1; i >= 0; i--) {
    leaves[i].update();
    leaves[i].show();
    if (leaves[i].offScreen()) {
      leaves.splice(i, 1);
    }
  }
}

function mousePressed() {
  for (let i = 0; i < 5; i++) {
    leaves.push(new Leaf(mouseX, mouseY));
  }
}

class Leaf {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(1, 3));
    this.angle = random(TWO_PI);
    this.rotation = random(-0.05, 0.05);
    this.size = random(20, 40);
  }

  update() {
    this.pos.add(this.vel);
    this.angle += this.rotation;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    // Draw a simple leaf shape (you can replace with image)
    fill(139, 69, 19); // brown
    noStroke();
    ellipse(0, 0, this.size, this.size / 2);
    pop();
  }

  offScreen() {
    return this.pos.y > height;
  }
}



