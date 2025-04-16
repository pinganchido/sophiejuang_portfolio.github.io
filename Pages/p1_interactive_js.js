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



document.addEventListener("DOMContentLoaded", function () {
  const i2_section = document.getElementById("i2");
  const i1_section = document.getElementById("i1");
  const glight_video = document.getElementById("glight_video");
  const wrapper = document.querySelector(".wrapper");

  const i2_oriCol =  "#606060";// original i2 color "lightblue#b6b6b6"
  const bgColors = ["#f0f8ff", "#ffcccb", "#d1e7dd", "#fff3cd", "#dbeafe"];
  let bgIndex = 0;

  //  Click inside #i2 to change background
 /* i2_section.addEventListener("click", () => {
    i2_section.style.backgroundColor = bgColors[bgIndex];
    bgIndex = (bgIndex + 1) % bgColors.length;
  });
  */
  // Change color based on video time
  glight_video.addEventListener("timeupdate", () => {
    const currTime = glight_video.currentTime;

    if (currTime >= 9 && currTime < 27) {
      i2_section.style.backgroundColor = "#f4e190"; // yellow
    } 
    else if (currTime >= 33 && currTime < 57) {
      i2_section.style.backgroundColor = "#f6ecf0"; // white
      
    }
    else if (currTime >= 62 && currTime < 82) {
      i2_section.style.backgroundColor = "#bbd19e"; // green
    } 
    else if (currTime >= 88 && currTime < 114) {
      i2_section.style.backgroundColor = "#7f90cd"; // blue

    }
    else if (currTime >= 120 && currTime < 152) {
      i2_section.style.backgroundColor = "#e89696"; // red

    }
    else {
      i2_section.style.backgroundColor = i2_oriCol; // default
    }
  });

  // Scroll background change for wrapper & body
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const i1 = document.getElementById("i1").offsetTop;
    const i2 = document.getElementById("i2").offsetTop;
    const i3 = document.getElementById("i3").offsetTop;

    if (scrollY >= i3) {
      document.body.style.backgroundColor = "lightcoral";
      //wrapper.style.backgroundColor = "lightcoral";
    } else if (scrollY >= i2) {
      //document.body.style.backgroundColor = i2_oriCol;
      //wrapper.style.backgroundColor = i2_oriCol;
      i2_section.style.backgroundColor = i2_oriCol; 
    } else {
      document.body.style.backgroundColor = "#F0FFF0";
      i2_section.style.backgroundColor = "#F0FFF0";
      i1_section.style.backgroundColor = "#F0FFF0";
      //wrapper.style.backgroundColor = "#F0FFF0";
    }
  });
});

//section 1 leaves
let leaves = [];

function setup() {
  //let canvas = createCanvas(windowWidth, windowHeight);
  const section = document.getElementById('i1');
  let canvas = createCanvas(section.offsetWidth, section.offsetHeight);
  canvas.parent('sketch-holder');
  canvas.style('position', 'absolute');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '10'); // Optional: put behind text
  clear(); // ensure it's transparent
}

function draw() {
 clear(); // translucent white for trailing effect

  for (let i = leaves.length - 1; i >= 0; i--) {
    leaves[i].update();
    leaves[i].show();
    if (leaves[i].offScreen()) {
      leaves.splice(i, 1);//delete from index i from leaves/ 1: delet one element 
    }
  }
}

function mousePressed() {

    let num = round(random(1, 5));
  for (let i = 0; i < num; i++) {
    //leaves.push(new Leaf(mouseX, mouseY));
    leaves.push(new Leaf(-5, -5));//init position x, y
  }
}

class Leaf {
    

  constructor(x, y) {
     const leaveColors = [
      color(228, 137, 134),
      color(227, 147, 125),
      color(232, 175, 125),
      color(238, 196, 135),
      color(236, 221,147),
      color(215, 221, 131),
      color(171, 192, 145),
      color(151, 190, 168),
      color(188, 219, 225),
      color(163, 168, 215),
      color(216, 205, 234),
      color(209, 184, 203),
      color(223, 154, 154)
    ];
    const stemColors = [
      color(199, 184, 169),
      color(238, 232, 227),
      color(115, 102, 89)
    ];
    this.pos = createVector(x, y);
    this.vel = createVector(random(section.offsetWidth / 1000, section.offsetWidth / 1000 + 2), random(section.offsetHeight / 1000, section.offsetHeight / 1000 + 1));//accerlation
    //this.angle = random(TWO_PI);
    this.rotation = random(-180, 180);
    this.rotateAngle = random(-5, 5);
    this.leaveColor = random(leaveColors);
    this.stemColor = random(stemColors);
    
  }

  update() {
    this.pos.add(this.vel);
    this.rotation += this.rotateAngle;
  }

  show() {
    push();

    let sizeX = random(40, 42);
    let sizeY = random(25, 30); 
   
    noStroke();
    fill(this.leaveColor);   
    translate(this.pos.x, this.pos.y);
    rotate(PI/180 * this.rotation);
    ellipse(0, 0, sizeY, sizeX);
    this.drawStem();
    pop();
  }

  drawStem(){
      fill(this.stemColor)
      rotate(PI / 180 * 20);
      arc(0, 0, 1.2, 60, PI / 10, PI / 2);
           
  }

  offScreen() {
    return this.pos.y > height;
  }
}



