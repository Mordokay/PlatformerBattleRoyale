var Game = {};

var dinamicObjects = [];
var staticObjects = [];
var playerObjects = [];

var cameraX = 0;
var cameraY = 0;

var playerId;
var playerPos = {x: 0, y: 0};

function setup() {
  Client.askNewPlayer();
  //canvas = createCanvas(800, 800);
  canvas = createCanvas(windowWidth,windowHeight);
  frameRate(30);
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

function draw() {
  background(255, 204, 0);
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