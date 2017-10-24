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

var dinamicObjects = [];
var staticObjects = [];
var players = [];

var width = 800;
var height = 800;

var Engine = Matter.Engine,
  // Render = Matter.Render,
  World = Matter.World,
  Body = Matter.Body,
  Bodies = Matter.Bodies;

var engine = Engine.create();
var world = engine.world;

Start();
setInterval(function(){Update();}, 1000/60);

function Start(){
    console.log("Start()");
    world.gravity.y = 1.8;
    console.log("world.gravity " + world.gravity.y);
    staticObjects.push(new Box(0, 1000, 2000, 50, 0, true));
    staticObjects.push(new Box(700, 900, 150, 50, 0, true));
    staticObjects.push(new Box(200, 700, 90, 50, 0, true));
    staticObjects.push(new Box(300, 800, 110, 50, 0, true));
    staticObjects.push(new Box(-100, 600, 600, 50, 0, true));
    staticObjects.push(new Box(400, 500, 80, 50, 0, true));
    staticObjects.push(new Box(500, 600, 120, 50, 0, true));
}

function Update(){
    for(var i = 0; i < dinamicObjects.length; i++){
        if (dinamicObjects[i].isOffScreen()) {
          dinamicObjects[i].removeFromWorld();
          dinamicObjects.splice(i, 1);
          i--;
        }
    }
    Engine.update(engine, 1000 / 60);
}

io.on('connection',function(socket){

    //sends info to all clients about the position of all dynamic objects
    setInterval(() => {
        var myDinamicObjects = [];
        for(var i = 0; i < dinamicObjects.length; i++){
            myDinamicObjects.push(dinamicObjects[i].getData());
        }
        io.emit('dinamicObjects', myDinamicObjects);

        var myPlayers = [];
        for(var i = 0; i < players.length; i++){
            myPlayers.push(players[i].getData());
        }
        io.emit('playerObjects', myPlayers);

        if(typeof socket.player != 'undefined' && 
          typeof getPlayerById(socket.player.id).body != 'undefined'){
          socket.emit('playerPos', getPlayerById(socket.player.id).body.position);
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

        players.push(new Player(socket.player.x, socket.player.y,
           50, 100 , 0, socket.player.id, socket.player.color));

        //sending to the client the playerId
        socket.emit('playerID', socket.player.id);

        var myStaticObjects = [];
        for(var i = 0; i < staticObjects.length; i++){
            myStaticObjects.push(staticObjects[i].getData());
        }
        io.emit('staticObjects', myStaticObjects);

        // sending to all clients except sender
        //socket.broadcast.emit('someMessage', someData);

    });

    socket.on('disconnect',function(){
      if (typeof socket.player != 'undefined'){
        for(var i = 0; i < players.length; i++){
          if(players[i].id == socket.player.id){
            players[i].removeFromWorld();
            players.splice(i, 1);
            i--;
          }
        }
        console.log("player with id: " + socket.player.id + " disconected!!!");
      }
    });

    socket.on('test',function(){
        console.log('test received');
    });

    socket.on('getallplayers', function(){
        io.sockets.emit('getallplayers', getAllPlayers());
    });
    
    socket.on('mouseClick', function(data){
        dinamicObjects.push(new Circle(data.x, data.y, randomIntFromInterval(5, 10), false));
        console.log("Received player " + socket.player.id + " mouse click at Pos: ( " + data.x + " , " + data.y + " )");
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
    isStatic: static
  }
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  World.add(world, this.body);

  this.isOffScreen = function() {
    var pos = this.body.position;
    return (pos.y > 1000);
  }

  this.canSeePlayer = function(playerPos) {
    var pos = this.body.position;
    return (abs(pos.x - playerPos.x) < 100 &&  abs(pos.y - playerPos.y) < 100);
  }

  this.removeFromWorld = function() {
    World.remove(world, this.body);
  }

  this.getData = function(){
    var data = {
      t: "circle",
      x: this.body.position.x,
      y: this.body.position.y,
      r: this.r
    }
    return data;
  }
}

function Box(x, y, w, h, a, static) {
  var options = {
    friction: 0,
    restitution: 0.15,
    angle: a,
    isStatic: static
  }
  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  World.add(world, this.body);

  this.getData = function(){
    var data = {
      t: "box",
      x: this.body.position.x,
      y: this.body.position.y,
      w: this.w,
      h: this.h,
      a: this.body.angle,
    }
    return data;
  }
}

function Player(x, y, w, h, a, id, c) {
  var options = {
    friction: 0,
    restitution: 0.12,
    angle: a,
    inertia: Infinity,
    mass: 10
  }

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
    Body.applyForce(this.body, this.body.position, { x: 0, y: -0.3})
    this.setVelocity();
  }

  this.getData = function(){
    var data = {
      t: "player",
      x: this.body.position.x,
      y: this.body.position.y,
      a: this.body.angle,
      c: this.color
    }
    return data;
  }
}