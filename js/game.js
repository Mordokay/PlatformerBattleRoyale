var Game = {};

var gameObjects = [];

var cameraX = 0;
var cameraY = 0;

var starImage;
var svgImage;
var platformImage;

var playerNetworkId;

var letterS = "9.170 85.682, 29.420 83.713, 36.838 98.690, 51.920 103.471, 67.072 99.217, 72.170 89.268, 70.025 83.045, 62.537 78.580, 45.873 74.080, 22.389 63.885, 12.897 43.143, 17.361 28.412, 30.229 17.971, 50.514 14.385, 79.729 22.893, 90.029 45.604, 69.217 46.518, 63.486 35.092, 50.303 31.611, 36.100 35.338, 32.795 41.736, 35.889 47.994, 55.014 54.885, 77.479 62.303, 88.869 72.779, 92.983 89.197, 88.061 105.791, 74.139 117.287, 51.709 121.049, 21.686 112.014, 9.170 85.682";
var letterV = "136.928 119.221, 100.084 16.143, 122.654 16.143, 148.740 92.432, 173.983 16.143, 196.061 16.143, 159.147 119.221";
var letterG = "254.772 81.322, 254.772 63.955, 299.631 63.955, 299.631 105.018, 280.682 116.162, 255.545 120.979, 227.350 114.193, 209.279 94.787, 203.233 67.330, 209.983 38.713, 229.740 19.518, 254.420 14.385, 284.408 22.436, 298.295 44.690, 277.623 48.557, 269.432 36.568, 254.420 32.174, 232.729 40.822, 224.678 66.486, 232.834 94.014, 254.209 103.190, 267.322 100.623, 278.608 94.400, 278.608 81.322";
var platform = "77.508 -45.105, 51.333 -38.091, 34.251 -21.010, 21.767 0.614, 14.443 27.948, 14.443 49.508, 14.443 80.512, 20.217 102.062, 30.479 119.836, 49.031 138.388, 71.851 144.503, 446.875 144.503, 473.911 137.258, 486.434 115.567, 494.291 86.245, 494.291 58.061, 494.291 24.920, 486.630 -3.674, 472.135 -28.779, 451.117 -40.914, 424.728 -47.985";
var star = "162.500 294.862, 101.230 262.953, 40.209 295.336, 51.622 227.204, 1.968 179.177, 70.292 168.978, 100.624 106.912, 131.438 168.741, 199.839 178.409, 150.558 226.820";

function setup() {
  Client.askNewPlayer();
  canvas = createCanvas(windowWidth,windowHeight);

  //Should I force the frame rate?
  //frameRate(60);

  starImage = loadImage("assets/star.png");
  svgImage = loadImage("assets/svg.png");
  platformImage = loadImage("assets/platform.png");
}

function keyTyped() {
  if (key === 'w' || key === ' ') {
    Client.Jump();
  }
  else if (key === 'a' || key === 'A') {
    Client.Left(true);
  }
  else if (key === 'd' || key === 'D') {
    Client.Right(true);
  }
}

function keyReleased() {
  if (key === 'A') {
    Client.Left(false);
  }
  if (key === 'D') {
    Client.Right(false);
  }
}

function mouseClicked() {
  var data = {x: winMouseX + parseInt(gameObjects[playerNetworkId].x) - (windowWidth / 2),
   y: winMouseY + parseInt(gameObjects[playerNetworkId].y)  - (windowHeight / 2)};

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

function drawStar(posX, posY, w, h){
  var shiftX = -85 * w;
  var shiftY = -67 * h;
  image(starImage, posX + shiftX, posY + shiftY, starImage.width * w, starImage.height * h);
}

function drawSVG(posX, posY, w, h){
  var shiftX = -130 * w;
  var shiftY = -53 * h;
  image(svgImage, posX + shiftX, posY + shiftY, svgImage.width * w, svgImage.height * h);
}

function drawPlatform(posX, posY, w, h){
  var scaleX = 0.265 * w;
  var scaleY = 0.265* h;
  var shiftX = -242 * w;
  var shiftY = -97 * h;
  image(platformImage, posX + shiftX, posY + shiftY, platformImage.width * scaleX, platformImage.height * scaleY);
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

//This function draw the bodies initialized on the server
function drawInitialMap(){  
  var myData;
  myData = {x: 0, y: 1000, w: 4000, h: 50, a: 0};
  drawBox(myData);

  myData = {x: 700, y: 900, w: 150, h: 50, a: 0};
  drawBox(myData);

  myData = {x: 200, y: 700, w: 90, h: 50, a: 0};
  drawBox(myData);

  myData = {x: 300, y: 800, w: 110, h: 50, a: 0};
  drawBox(myData);

  myData = {x: -100, y: 600, w: 600, h: 50, a: 0};
  drawBox(myData);

  myData = {x: 400, y: 500, w: 80, h: 50, a: 0};
  drawBox(myData);

  myData = {x: 500, y: 600, w: 120, h: 50, a: 0};
  drawBox(myData);

  //vertical walls (for wall jump):
  drawBox({x: 1000, y: 900, w: 50, h: 400, a: 0});
  drawBox({x: 1300, y: 600, w: 50, h: 400, a: 0});
  drawBox({x: 1600, y: 300, w: 50, h: 400, a: 0});

  drawBox({x: 1900, y: 0, w: 50, h: 400, a: 0});

  drawBox({x: 1600, y: -300, w: 50, h: 400, a: 0});
  drawBox({x: 1300, y: -600, w: 50, h: 400, a: 0});
  drawBox({x: 1000, y: -900, w: 50, h: 400, a: 0});
}

function draw() {
  background(50, 50, 200);

  if(typeof gameObjects[playerNetworkId] != 'undefined'){
    camera(gameObjects[playerNetworkId].x - (width / 2), gameObjects[playerNetworkId].y - (height / 2), 0);
  }

  drawInitialMap();

  for (var i = 0; i < gameObjects.length; i++) {
    if(gameObjects[i]){
      switch(gameObjects[i].t){
        case 'c':
          drawCircle(gameObjects[i]);
          break;
        case 'b':
          drawBox(gameObjects[i]);
          break;
        case 'p':
          drawPlayer(gameObjects[i]);
          break;
        case 'star':
          drawStar(parseInt(gameObjects[i].x), parseInt(gameObjects[i].y), parseFloat(gameObjects[i].w), parseFloat(gameObjects[i].h));
          break;
        case 'weirdPlatform':
          drawPlatform(parseInt(gameObjects[i].x), parseInt(gameObjects[i].y), parseFloat(gameObjects[i].w), parseFloat(gameObjects[i].h));
          break;
        case 'svg':
          drawSVG(parseInt(gameObjects[i].x), parseInt(gameObjects[i].y), parseFloat(gameObjects[i].w), parseFloat(gameObjects[i].h));
          break;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

Game.setPlayerNetworkId = function(id){
  playerNetworkId = id;
}

Game.addElement = function(elementData){
  //b <objectNetworkId> <Posx> <PosY> <Width> <Height> <Angle>
  //p <objectNetworkId> <Posx> <PosY> <Angle> <r> <g> <b>
  //c <objectNetworkId> <Posx> <PosY> <Radius>
  //<label> <objectNetworkId> <Posx> <PosY> <w> <h>
  //<label>: 'star' | 'svg' | 'weirdPlatform'

  var MyData = elementData.split(" ");
  //console.log("initialized element with id: " + MyData[1]);
  switch(MyData[0]) {
    case 'b':
      gameObjects[MyData[1]] = {t: MyData[0], networkId: MyData[1], x: MyData[2], y: MyData[3], w: MyData[4], h: MyData[5], a: MyData[6]};
      break;
    case 'p':
      gameObjects[MyData[1]] = {t: MyData[0], networkId: MyData[1], x: MyData[2], y: MyData[3], a: MyData[4], c: {r: MyData[5],g: MyData[6],b: MyData[7]}};
      break;
    case 'c':
      gameObjects[MyData[1]] = {t: MyData[0], networkId: MyData[1], x: MyData[2], y: MyData[3], r: MyData[4]};
      break;
    case 'star':
      gameObjects[MyData[1]] = {t: MyData[0], networkId: MyData[1], x: MyData[2], y: MyData[3], w: MyData[4], h: MyData[5]};
      break;
    case 'svg':
      gameObjects[MyData[1]] = {t: MyData[0], networkId: MyData[1], x: MyData[2], y: MyData[3], w: MyData[4], h: MyData[5]};
      break;
    case 'weirdPlatform':
      gameObjects[MyData[1]] = {t: MyData[0], networkId: MyData[1], x: MyData[2], y: MyData[3], w: MyData[4], h: MyData[5]};
      break;
    default:
      break;
  }
  //console.log(gameObjects);
}

Game.processData =  function(dataString){
  //console.log(dataString);
  //<objectNetworkId> <Posx> <PosY>
  //<objectNetworkId> <Posx> <PosY>
  //<objectNetworkId> <Posx> <PosY>

  var myData = dataString.split(",");
  for(var i = 0; i < myData.length; i++){
    var newPos = myData[i].split(" ");
    if(gameObjects[newPos[0]] != null){
      gameObjects[newPos[0]].x = newPos[1];
      gameObjects[newPos[0]].y = newPos[2];
    }
  }
}

Game.removeElement = function(elementID){
  gameObjects[elementID] = null;
  //console.log(gameObjects);
}

Game.initializeElements = function(dataString){
  //console.log(dataString);
  var myData = dataString.split(",");
  for(var i = 0; i < myData.length; i++){
    Game.addElement(myData[i]);
  }
}