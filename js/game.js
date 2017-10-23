var Game = {};

var dinamicObjects = [];
var staticObjects = [];

function setup() {
  Client.askNewPlayer();
  createCanvas(400, 400);
}

function keyPressed() {
  if (keyCode === ENTER) {
    Client.sendTest();
  }
}

function mouseClicked() {
  var data = {x: mouseX, y: mouseY};
  Client.sendMouseClick(data);
}

function drawCircle(data){
  var posX = data.posX;
  var posY = data.posY;
  var angle = data.angle;
  var r = data.r;

  push();
  translate(posX, posY);
  rotate(angle);
  rectMode(CENTER);
  strokeWeight(1);
  stroke(255);
  fill(127);
  ellipse(0, 0, r * 2);
  pop();
}

function drawBox(data){
  var posX = data.posX;
  var posY = data.posY;
  var angle = data.angle;
  var w = data.w;
  var h = data.h;

  push();
  translate(posX, posY);
  rotate(angle);
  rectMode(CENTER);
  strokeWeight(1);
  noStroke();
  fill(0);
  rect(0, 0, w, h);
  pop();
}

function draw() {
  background(255, 204, 0);
  //console.log(dinamicObjects.length);

  for (var i = 0; i < dinamicObjects.length; i++) {
    drawCircle(dinamicObjects[i]);
  }
  for (var i = 0; i < staticObjects.length; i++) {
    console.log(staticObjects[0].posX + " , " +  staticObjects[0].posY + " W,H: " + staticObjects[0].w + " , " + staticObjects[0].h);
    drawBox(staticObjects[i]);
  }

  /*
  circles.push(new Circle(200, 50, random(5, 10)));
  Engine.update(engine);

  for (var i = 0; i < circles.length; i++) {
    circles[i].show();
    if (circles[i].isOffScreen()) {
      circles[i].removeFromWorld();
      circles.splice(i, 1);
      i--;
    }
  }
  for (var i = 0; i < boundaries.length; i++) {
    boundaries[i].show();
  }
  */
}

Game.addNewPlayer = function(data){

}

Game.setDinamicObjects = function(data){
  dinamicObjects = data;
}

Game.setStaticObjects = function(data){
  staticObjects = data;
}