var Game = {};

var images = [];
var totalImages = 40;
var counterImage = 0;
var loadingImage = false;
var loading = true;
var currentImageIndex = 0;

var dinamicObjects = [];
var staticObjects = [];
var playerObjects = [];

var cameraX = 0;
var cameraY = 0;

var playerId;
var playerPos = {x: 0, y: 0};

var letterS = "9.170 85.682, 29.420 83.713, 36.838 98.690, 51.920 103.471, 67.072 99.217, 72.170 89.268, 70.025 83.045, 62.537 78.580, 45.873 74.080, 22.389 63.885, 12.897 43.143, 17.361 28.412, 30.229 17.971, 50.514 14.385, 79.729 22.893, 90.029 45.604, 69.217 46.518, 63.486 35.092, 50.303 31.611, 36.100 35.338, 32.795 41.736, 35.889 47.994, 55.014 54.885, 77.479 62.303, 88.869 72.779, 92.983 89.197, 88.061 105.791, 74.139 117.287, 51.709 121.049, 21.686 112.014, 9.170 85.682";
var letterV = "136.928 119.221, 100.084 16.143, 122.654 16.143, 148.740 92.432, 173.983 16.143, 196.061 16.143, 159.147 119.221";
var letterG = "254.772 81.322, 254.772 63.955, 299.631 63.955, 299.631 105.018, 280.682 116.162, 255.545 120.979, 227.350 114.193, 209.279 94.787, 203.233 67.330, 209.983 38.713, 229.740 19.518, 254.420 14.385, 284.408 22.436, 298.295 44.690, 277.623 48.557, 269.432 36.568, 254.420 32.174, 232.729 40.822, 224.678 66.486, 232.834 94.014, 254.209 103.190, 267.322 100.623, 278.608 94.400, 278.608 81.322";
var platform = "77.508 -45.105, 51.333 -38.091, 34.251 -21.010, 21.767 0.614, 14.443 27.948, 14.443 49.508, 14.443 80.512, 20.217 102.062, 30.479 119.836, 49.031 138.388, 71.851 144.503, 446.875 144.503, 473.911 137.258, 486.434 115.567, 494.291 86.245, 494.291 58.061, 494.291 24.920, 486.630 -3.674, 472.135 -28.779, 451.117 -40.914, 424.728 -47.985";

function setup() {
  Client.askNewPlayer();
  //canvas = createCanvas(800, 800);
  canvas = createCanvas(windowWidth,windowHeight);

  //Should I force the frame rate?
  //frameRate(60);

  for (var i = 1; i <= totalImages; i++) {
    loadImageElement("assets/images/anim" + i + ".png", 300, 300);
  }
}

function loadImageElement(filename, imageWidth, imageHeight) {
  loadImage(filename, imageLoaded);

  function imageLoaded(image) {
    console.log(filename);
    image.resize(imageWidth, imageHeight);
    images.push(image);
    counterImage++;
    if (counterImage == totalImages) {
      loadingImage = true;
    }
  }
}

function keyTyped() {
  if (key === 'w' || key === ' ') {
    //console.log('W or SPACE');
    Client.Jump();
  }
  else if (key === 'a') {
    //console.log('A');
    Client.Left(true);
  }
  else if (key === 's') {
    //console.log('A');
    //DO nothing on S key ... maybe a crouch?
  }
  else if (key === 'd') {
    //console.log('D');
    Client.Right(true);
  }
}

function keyReleased() {
  if (key === 'W') {
    //console.log('Released W');
  }
  if (key === 'A') {
    //console.log('Released A');
    Client.Left(false);
  }
  if (key === 'S') {
    //console.log('Released S');
  }
  if (key === 'D') {
    //console.log('Released D');
    Client.Right(false);
  }
}

function mouseClicked() {
  var data = {x: winMouseX + playerPos.x - (windowWidth / 2),
   y: winMouseY + playerPos.y  - (windowHeight / 2)};
  //console.log("mouseX: " + mouseX + " mouseY: " + mouseY);
  //console.log("winMouseX: " + winMouseX + " winMouseY: " + winMouseY);
  //console.log("windowWidth: " + windowWidth + " windowHeight " + windowHeight);
  Client.sendMouseClick(data);
}

function drawCircle(data){
  push();
  translate(data.x, data.y);
  rectMode(CENTER);
  strokeWeight(1);
  stroke(255);
  fill(127);
  ellipse(0, 0, data.r * 2);
  pop();
}

function drawBox(data){
  push();
  translate(data.x, data.y);
  rotate(data.a);
  rectMode(CENTER);
  strokeWeight(1);
  noStroke();
  fill(0);
  rect(0, 0, data.w, data.h);
  pop();
}

function drawPlayer(data){
  push();
  translate(data.x, data.y);
  rotate(data.a);
  rectMode(CENTER);

  //strokeWeight(1);
  //noStroke();
  //fill(0);

  strokeWeight(2);
  stroke(data.c.r, data.c.g, data.c.b);
  fill(data.c.r, data.c.g, data.c.b, 127);

  rect(0, 0, 50, 100);
  pop();
}

function drawShape(shapeString, data){

  push();
  translate(data.x + data.shiftX, data.y + data.shiftY);
  rotate(data.a);

  strokeWeight(5);
  stroke(0, 100, 100);
  fill(200, 20, 20);

  myVertices = shapeString.split(", ");
  beginShape();
  var pos = [];
  for (var i = 0; i < myVertices.length; i++){
    pos = myVertices[i].split(' ');
    vertex(pos[0], pos[1]);
  }

  pos = myVertices[0].split(' ');
  vertex(pos[0], pos[1]);

  pos = myVertices[1].split(' ');
  vertex(pos[0], pos[1]);

  endShape();

  pop();
}

function polygon(x, y, radius, npoints) {
  var angle = TWO_PI / npoints;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function drawAnimatedStickMan(x, y){
  push();
  translate(x, y);
  if(currentImageIndex == images.length){
    currentImageIndex = 0;
  }
  image(images[currentImageIndex], 0, 0);
  currentImageIndex++;
  polygon(0, 0, 5, 8);
  pop();
}

function draw() {
  background(255, 204, 0);

  if (loadingImage) {
    loading = false;
  }

  if(!loading){
    //console.log("playerPos: " + playerPos.x + " , " + playerPos.y);
    camera(playerPos.x - (width / 2), playerPos.y - (height / 2), 0);

    for (var i = 0; i < dinamicObjects.length; i++) {
      drawCircle(dinamicObjects[i]);
    }
    for (var i = 0; i < staticObjects.length; i++) {
      drawBox(staticObjects[i]);
    }
    for (var i = 0; i < playerObjects.length; i++) {
      drawPlayer(playerObjects[i]);
    }

    var myData = {x: -500, y: 300, shiftX: -138, shiftY: -64, a: 0};
    drawShape(letterS, myData);

    var myData = {x: -500, y: 300, shiftX: -138, shiftY: -64, a: 0};
    drawShape(letterV, myData);

    var myData = {x: -500, y: 300, shiftX: -138, shiftY: -64, a: 0};
    drawShape(letterG, myData);

    var myData = {x: -500, y: 750, shiftX: -258, shiftY: -50, a: 0};
    drawShape(platform, myData);
    polygon(myData.x, myData.y, 10, 8);

    drawAnimatedStickMan(100, 600);

    drawAnimatedStickMan(-500, 400);

    drawAnimatedStickMan(500, 500);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

Game.setPlayerId = function(id){
  playerId = id;
}

Game.setStaticObjects = function(data){
  staticObjects = data;
}

Game.setDinamicObjects = function(data){
  dinamicObjects = data;
}

Game.setPlayerObjects = function(data){
  playerObjects = data;
}

Game.setPlayerPos = function(data){
  playerPos = data;
}