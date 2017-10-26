var Matter = require('matter-js/build/matter.js');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname));
app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/libraries',express.static(__dirname + '/libraries'));


app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(process.env.PORT || 25565,function(){
    console.log('Listening on '+server.address().port);
});

var initialStaticObjects = [];
var dinamicObjects = [];
var players = [];

var Engine = Matter.Engine,
  // Render = Matter.Render,
  World = Matter.World,
  Body = Matter.Body,
  Common = Matter.Common,
  Vertices = Matter.Vertices,
  Vector = Matter.Vector,
  Svg = Matter.Svg,
  Events = Matter.Events,
  Bodies = Matter.Bodies;

var engine = Engine.create();
var world = engine.world;
var letterS_Coords = "9.170 85.682, 29.420 83.713, 36.838 98.690, 51.920 103.471, 67.072 99.217, 72.170 89.268, 70.025 83.045, 62.537 78.580, 45.873 74.080, 22.389 63.885, 12.897 43.143, 17.361 28.412, 30.229 17.971, 50.514 14.385, 79.729 22.893, 90.029 45.604, 69.217 46.518, 63.486 35.092, 50.303 31.611, 36.100 35.338, 32.795 41.736, 35.889 47.994, 55.014 54.885, 77.479 62.303, 88.869 72.779, 92.983 89.197, 88.061 105.791, 74.139 117.287, 51.709 121.049, 21.686 112.014, 9.170 85.682";
var letterV_Coords = "136.928 119.221, 100.084 16.143, 122.654 16.143, 148.740 92.432, 173.983 16.143, 196.061 16.143, 159.147 119.221";
var letterG_Coords = "254.772 81.322, 254.772 63.955, 299.631 63.955, 299.631 105.018, 280.682 116.162, 255.545 120.979, 227.350 114.193, 209.279 94.787, 203.233 67.330, 209.983 38.713, 229.740 19.518, 254.420 14.385, 284.408 22.436, 298.295 44.690, 277.623 48.557, 269.432 36.568, 254.420 32.174, 232.729 40.822, 224.678 66.486, 232.834 94.014, 254.209 103.190, 267.322 100.623, 278.608 94.400, 278.608 81.322";
var platform_Coords = "77.508 -45.105, 51.333 -38.091, 34.251 -21.010, 21.767 0.614, 14.443 27.948, 14.443 49.508, 14.443 80.512, 20.217 102.062, 30.479 119.836, 49.031 138.388, 71.851 144.503, 446.875 144.503, 473.911 137.258, 486.434 115.567, 494.291 86.245, 494.291 58.061, 494.291 24.920, 486.630 -3.674, 472.135 -28.779, 451.117 -40.914, 424.728 -47.985";
var star_Coords = "162.500 294.862, 101.230 262.953, 40.209 295.336, 51.622 227.204, 1.968 179.177, 70.292 168.978, 100.624 106.912, 131.438 168.741, 199.839 178.409, 150.558 226.820";

var platformMask = 0x0001,
        weirdObjectMask = 0x0002,
        playerMask = 0x0004,
        circleMask = 0x0008;

var networkIdStack = [];

Start();
setInterval(function(){Update();}, 1000/60);

Events.on(engine, 'collisionActive', function(event) {
  var i, pair,
  length = event.pairs.length;

  for (i = 0; i < length; i++) {
    pair = event.pairs[i];
    console.log(pair.bodyA.label + " is colliding with  " + pair.bodyB.label);

    if(pair.bodyA.label == 'player' && pair.bodyB.label == 'star' || 
      pair.bodyA.label == 'star' && pair.bodyB.label == 'player'){
      console.log("Condition verified!!! You can now remove the star and add points to the player");
    }
    /*
    if (!(pair.bodyA.label === 'Player' || pair.bodyB.label === 'Player')) {
      continue;
    }
    Matter.Events.trigger(player.body, 'collision', { pair : pair });
    */
  }
});

function Start(){
    //initialize 50 diferent networkIDs
    for(var i = 50; i > 0; i--){
      networkIdStack.push(i);
    }

    console.log("Start()");
    world.gravity.y = 2;
    console.log("world.gravity " + world.gravity.y);
    initialStaticObjects.push(new Platform(0, 1000, 2000, 50, 0, true));
    initialStaticObjects.push(new Platform(700, 900, 150, 50, 0, true));
    initialStaticObjects.push(new Platform(200, 700, 90, 50, 0, true));
    initialStaticObjects.push(new Platform(300, 800, 110, 50, 0, true));
    initialStaticObjects.push(new Platform(-100, 600, 600, 50, 0, true));
    initialStaticObjects.push(new Platform(400, 500, 80, 50, 0, true));
    initialStaticObjects.push(new Platform(500, 600, 120, 50, 0, true));

    initialStaticObjects.push(new objectFromVertices([letterS_Coords, letterV_Coords, letterG_Coords], -500, 300, 0, true, "SVG"));
    initialStaticObjects.push(new objectFromVertices([platform_Coords], -500, 750, 0, true, "weirdPlatform"));
    initialStaticObjects.push(new objectFromVertices([star_Coords], 100, 300, 0, true, "star"));
}

function Update(){
    for(var i = 0; i < dinamicObjects.length; i++){
        if (dinamicObjects[i].isOffScreen()) {
          dinamicObjects[i].removeFromWorld();
          io.sockets.emit('removeElement', dinamicObjects[i].objectNetworkId);
          freeNetworkID(dinamicObjects[i].objectNetworkId);
          dinamicObjects.splice(i, 1);
          i--;
        }
    }
    for(var i = 0; i < players.length; i++){
      players[i].setVelocity();
    }
    Engine.update(engine, 1000 / 60);
}

io.on('connection',function(socket){

    //sends info to all clients about the position of all dynamic objects
    setInterval(() => {
        var gameData = "";
        for(var i = 0; i < dinamicObjects.length; i++){
            if(Vector.magnitude(dinamicObjects[i].body.velocity) > 0.01){
              gameData += dinamicObjects[i].getPosUpdate() + ",";
            }
        }
        for(var i = 0; i < players.length; i++){
              gameData += players[i].getPosUpdate() + ",";
        }
        var gameData = gameData.slice(0, -1);
        if(gameData != ""){
          io.emit('serverData', gameData);
        }
    }, 1000/60);

    socket.on('newplayer',function(){
        socket.player = {
            id: socket.id,
            x: randomInt(100,300),
            y: randomInt(100,300),
            color: {r: randomInt(0, 255), g: randomInt(0, 255), b: randomInt(0, 255)}
        };
        console.log('player with id: ' + socket.player.id + ' connected at position: ( ' +
         socket.player.x  + ' , ' + socket.player.y + ' )');

        var initialElements = "";
        for(var i = 0; i < dinamicObjects.length; i++){
            //if(Vector.magnitude(dinamicObjects[i].body.velocity) > 0.01){
              initialElements += dinamicObjects[i].getData() + ",";
            //}
        }
        for(var i = 0; i < players.length; i++){
            if(!players[i].body.isSleeping){
              initialElements += players[i].getData() + ";";
            }
        }
        var initialElements = initialElements.slice(0, -1);
        socket.emit('initialElements', initialElements);

        var myPlayer = new Player(socket.player.x, socket.player.y, 50, 100 , 0, socket.player.id, socket.player.color)
        players.push(myPlayer);
        io.sockets.emit('addElement', myPlayer.getData());

        //sending to the client the playerId
        socket.emit('playerNetworkID', myPlayer.objectNetworkId);
    });

    socket.on('disconnect',function(){
      if (typeof socket.player != 'undefined'){
        for(var i = 0; i < players.length; i++){
          if(players[i].id == socket.player.id){
            players[i].removeFromWorld();
            io.sockets.emit('removeElement', players[i].objectNetworkId);
            freeNetworkID(players[i].objectNetworkId);
            players.splice(i, 1);
            i--;
          }
        }
        console.log("player with id: " + socket.player.id + " disconected!!!");
      }
    });

    socket.on('getallplayers', function(){
        io.sockets.emit('getallplayers', getAllPlayers());
    });
    
    socket.on('mouseClick', function(data){
      if(networkIdStack.length>0){
        var myCircle = new Circle(data.x, data.y, randomIntFromInterval(4, 6), false)
        dinamicObjects.push(myCircle);
        io.sockets.emit('addElement', myCircle.getData());
      }
        //console.log("Received player " + socket.player.id + " mouse click at Pos: ( " + data.x + " , " + data.y + " )");
    });

    //L_DOWN  L_UP  R_DOWN  R_UP  Jsss
    socket.on('L_DOWN', function(){
      getPlayerById(socket.player.id).pressingLeft = true;
      getPlayerById(socket.player.id).setVelocity();
    });
    socket.on('L_UP', function(){
      getPlayerById(socket.player.id).pressingLeft = false;
      getPlayerById(socket.player.id).setVelocity();
    });
    socket.on('R_DOWN', function(){
      getPlayerById(socket.player.id).pressingRight = true;
      getPlayerById(socket.player.id).setVelocity();
    });
    socket.on('R_UP', function(){
      getPlayerById(socket.player.id).pressingRight = false;
      getPlayerById(socket.player.id).setVelocity();
    });
    socket.on('J', function(){
      getPlayerById(socket.player.id).jump(-0.04);
    });
});

function freeNetworkID(networkID){
  console.log('Free networkID: ' + networkID);
  networkIdStack.push(networkID);
  networkIdStack.sort();
  networkIdStack.reverse();
}

function getPlayerById(id){
  for(var i = 0; i < players.length; i++){
    if(players[i].id == id){
      return players[i];
    }
  }
  return false;
}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * high) + low;
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

function Circle(x, y, r, static) {
  var options = {
    friction: 0,
    restitution: 0.8,
    isStatic: static,
    collisionFilter: {
      category: circleMask,
      mask: platformMask | playerMask | circleMask | weirdObjectMask
    }
  }
  this.objectNetworkId = networkIdStack.pop();
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  World.add(world, this.body);

  this.isOffScreen = function() {
    var pos = this.body.position;
    return (pos.y > 1000);
  }

  this.canSeePlayer = function(playerPos) {
      //TODO: Only send this obect info to the player if player can see this object
  }

  this.removeFromWorld = function() {
    World.remove(world, this.body);
  }

  //c <objectNetworkId> <Posx> <PosY> <Radius>
  this.getData = function(){
    var data = "c " + this.objectNetworkId + " " + (Math.round( this.body.position.x * 100 ) / 100) + " " +
      (Math.round( this.body.position.y * 100 ) / 100) + " " + this.r;
    return data;
  }

  //c <objectNetworkId> <Posx> <PosY>
  this.getPosUpdate = function(){
    var data = this.objectNetworkId + " " + (Math.round( this.body.position.x * 100 ) / 100) + " " +
      (Math.round( this.body.position.y * 100 ) / 100);
    return data;
  }
}

function Platform(x, y, w, h, a, static) {
  var options = {
    friction: 0,
    restitution: 0.15,
    angle: a,
    isStatic: static,
    label: "platform",
    collisionFilter: {
      category: platformMask,
      mask: circleMask | playerMask | weirdObjectMask
    }
  }
  this.objectNetworkId = networkIdStack.pop();
  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  World.add(world, this.body);

  //b <objectNetworkId> <Posx> <PosY> <Width> <Height> <Angle>
  this.getData = function(){
    var data = "b " + this.objectNetworkId + " " + (Math.round( this.body.position.x * 100 ) / 100) + " " +
      (Math.round( this.body.position.y * 100 ) / 100) + " " + this.w + " " + this.h + " " + this.body.angle;
    return data;
  }

  //b <objectNetworkId> <Posx> <PosY>
  this.getPosUpdate = function(){
    var data = this.objectNetworkId + " " + (Math.round( this.body.position.x * 100 ) / 100) + " " +
      (Math.round( this.body.position.y * 100 ) / 100);
    return data;
  }
}

function Player(x, y, w, h, a, id, c) {
  var options = {
    label: 'player',
    friction: 0,
    restitution: 0.12,
    angle: a,
    inertia: Infinity,
    mass: 10,
    collisionFilter: {
      category: playerMask,
      mask: circleMask | playerMask | platformMask | weirdObjectMask
    }
  }
  this.objectNetworkId = networkIdStack.pop();
  this.color = c;
  this.pressingLeft = false;
  this.pressingRight = false;
  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  this.id = id;
  World.add(world, this.body);

  this.removeFromWorld = function() {
    World.remove(world, this.body);
  }
  
  this.setVelocity = function(){
    var myVelocityX = 0;
    if(this.pressingLeft && !this.pressingRight){
      myVelocityX = -6;
    }
    else if(!this.pressingLeft && this.pressingRight){
      myVelocityX = 6;
    }
    Body.setVelocity(this.body, {
          x: myVelocityX,
          y: this.body.velocity.y
        });
  }

  this.jump = function(){
    Body.applyForce(this.body, this.body.position, { x: 0, y: -0.6})
    this.setVelocity();
  }

  //p <objectNetworkId> <Posx> <PosY> <Angle> <r> <g> <b>
  this.getData = function(){
    var data = "p " + this.objectNetworkId + " " + (Math.round( this.body.position.x * 100 ) / 100) + " " +
      (Math.round( this.body.position.y * 100 ) / 100) + " " + this.body.angle + " " + this.color.r + " " + this.color.g + " " + this.color.b;
    return data;
  }

  //p <objectNetworkId> <Posx> <PosY>
  this.getPosUpdate = function(){
    var data = this.objectNetworkId + " " + (Math.round( this.body.position.x * 100 ) / 100) + " " +
      (Math.round( this.body.position.y * 100 ) / 100);
    return data;
  }
}

function randomConvexPolygon(size) { //returns a string of vectors that make a convex polygon
  var polyVector = '';
  var x = 0;
  var y = 0;
  var r = 0;
  var angle = 0;
  for (var i = 1; i < 60; i++) {
    angle += 0.1 + Math.random() * 0.2; //change in angle in radians
    if (angle > 2 * Math.PI) {
      break; //stop before it becomes convex
    }
    r = 2 + Math.random() * 2;
    x = Math.round(x + r * Math.cos(angle));
    y = Math.round(y + r * Math.sin(angle));
    polyVector = polyVector.concat(x * size + ' ' + y * size + ' ');
  }
  //console.log(polyVector);
  return polyVector;
}

function objectFromVertices(polygonData, x, y, a, static, label) {

  var vertexSets = [];
  for(var i = 0; i < polygonData.length; i++){
    vertexSets.push(Vertices.fromPath(polygonData[i]));
  } 
  var options = {
    friction: 0,
    restitution: 0.15,
    angle: a,
    isStatic: static,
    label: label,
    collisionFilter: {
                category: weirdObjectMask,
                mask: circleMask | playerMask
            }
  }

  this.body = Bodies.fromVertices(x, y, vertexSets, options);
  World.add(world, this.body);
}