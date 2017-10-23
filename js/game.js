var Game = {};

var dinamicObjects = [];
var staticObjects = [];

var cameraX = 0;
var cameraY = 0;

function setup() {
  Client.askNewPlayer();
  canvas = createCanvas(400, 400);
  frameRate(30);
}

function keyPressed() {
  if (keyCode === ENTER) {
    Client.sendTest();
  }
}

function mouseClicked() {
  var data = {x: mouseX + cameraX, y: mouseY + cameraY};
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

function draw() {
  background(255, 204, 0);
/*
  if(keyIsDown(LEFT_ARROW)){
    cameraX -= 10;
  }
  if(keyIsDown(RIGHT_ARROW)){
    cameraX += 10;
  }
  if(keyIsDown(UP_ARROW)){
    cameraY -= 10;
  }
  if(keyIsDown(DOWN_ARROW)){
    cameraY += 10;
  }

  if(dinamicObjects.length > 0){
    camera(dinamicObjects[0].posX - (width / 2), dinamicObjects[0].posY - (height / 2), 0);  
  }
  else{
    camera(cameraX, cameraY, 0);
  }

  console.log("CameraX: " + cameraX + " CameraY: " + cameraY);
*/

  for (var i = 0; i < dinamicObjects.length; i++) {
    drawCircle(dinamicObjects[i]);
  }
  for (var i = 0; i < staticObjects.length; i++) {
    drawBox(staticObjects[i]);
  }
}

Game.addNewPlayer = function(data){

}

Game.setDinamicObjects = function(data){
  dinamicObjects = data;
}

Game.setStaticObjects = function(data){
  staticObjects = data;
}