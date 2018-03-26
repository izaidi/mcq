var canvas;
var stage;
var width = 650;
var height = 400;

var particles = [];
var flameParticles = [];

var max = 25;
var speed = 5;
var torchFlameSize = 20;
var cauldronFlameSize = 20;

//The class we will use to store particles. It includes x and y
//coordinates, horizontal and vertical speed, and how long it's
//been "alive" for.
function Particle(x, y, xs, ys) {
  this.x=x;
  this.y=y;
  this.xs=xs;
  this.ys=ys;
  this.life=0;
}

function resizeCanvas() {
  setTimeout(function() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    stage.globalCompositeOperation="lighter"
  }, 0);
}

function initFire() {
  
  //Reference to the HTML element
  canvas=document.getElementById("game");
  
  resizeCanvas();
  
  //See if the browser supports canvas
  if (canvas.getContext) {
    
    //Get the canvas context to draw onto
    stage = canvas.getContext("2d");
    
    //Makes the colors add onto each other, producing
    //that nice white in the middle of the fire
    stage.globalCompositeOperation="xor";
    
    //Update the mouse position
    //canvas.addEventListener("mousemove", getMousePos);
    
    window.addEventListener("resize", function() {
      resizeCanvas();
      stage.globalCompositeOperation="lighter";
    });
    
    //Update the particles every frame
    var timer=setInterval(update,50);
    
  } else {
    alert("Canvas not supported.");
  }
}

function update() {
  updateFire();
  if (flameOn) {
    updateFlame();
  }
}

function updateFire() {

  //Adds ten new particles every frame
  for (var i=0; i<10; i++) {
    
    //Adds a particle at the mouse position, with random horizontal and vertical speeds
    var p = new Particle(sparkX, sparkY, (Math.random()*2*speed-speed)/2, 0-Math.random()*2*speed);
    particles.push(p);
  }
  
  //Clear the stage so we can draw the new frame
  stage.clearRect(0, 0, width, height);
  
  //Cycle through all the particles to draw them
  for (i=0; i<particles.length; i++) {
    
    //Set the file colour to an RGBA value where it starts off red-orange, but progressively gets more grey and transparent the longer the particle has been alive for
    stage.fillStyle = "rgba("+(260-(particles[i].life*2))+","+((particles[i].life*2)+50)+","+(particles[i].life*2)+","+(((max-particles[i].life)/max)*0.4)+")";
    
    stage.beginPath();
    //Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
    stage.arc(particles[i].x,particles[i].y,(max-particles[i].life)/max*(torchFlameSize/2)+(torchFlameSize/2),0,2*Math.PI);
    stage.fill();
    
    //Move the particle based on its horizontal and vertical speeds
    particles[i].x+=particles[i].xs;
    particles[i].y+=particles[i].ys;
    
    particles[i].life++;
    //If the particle has lived longer than we are allowing, remove it from the array.
    if (particles[i].life >= max) {
      particles.splice(i, 1);
      i--;
    }
  }
}


function updateFlame() {

  //Adds ten new particles every frame
  for (var i=0; i<10; i++) {
    
    //Adds a particle at the mouse position, with random horizontal and vertical speeds
    var particleOffset = (Math.random() - 0.5) * (cauldronWidth / 2);
    var p = new Particle(flameX + particleOffset, flameY, (Math.random()*2*speed-speed)/2, 0-Math.random()*2*speed);
    flameParticles.push(p);
  }
  
  //Clear the stage so we can draw the new frame
  //stage.clearRect(0, 0, width, height);
  
  //Cycle through all the particles to draw them
  for (i=0; i<flameParticles.length; i++) {
    
    //Set the file colour to an RGBA value where it starts off red-orange, but progressively gets more grey and transparent the longer the particle has been alive for
    stage.fillStyle = "rgba("+(260-(flameParticles[i].life*2))+","+((flameParticles[i].life*2)+50)+","+(flameParticles[i].life*2)+","+(((max-flameParticles[i].life)/max)*0.4)+")";
    
    stage.beginPath();
    //Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
    stage.arc(
      flameParticles[i].x,flameParticles[i].y,
      (max-flameParticles[i].life)/max*(cauldronFlameSize/2)+(cauldronFlameSize/2),0,2*Math.PI
    );
    stage.fill();
    
    //Move the particle based on its horizontal and vertical speeds
    flameParticles[i].x+=flameParticles[i].xs;
    flameParticles[i].y+=flameParticles[i].ys;
    
    flameParticles[i].life++;
    //If the particle has lived longer than we are allowing, remove it from the array.
    if (flameParticles[i].life >= max) {
      flameParticles.splice(i, 1);
      i--;
    }
  }
}
