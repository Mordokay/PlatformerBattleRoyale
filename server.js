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

server.lastPlayerID = 0;

server.listen(process.env.PORT || 25565,function(){
    console.log('Listening on '+server.address().port);
});

var dinamicObjects = [];
var staticObjects = [];
var players = [];

var width = 400;
var height = 400;

var Engine = Matter.Engine,
  // Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies;

var engine = Engine.create();
var world = engine.world;

Start();
setInterval(function(){Update();}, 1000/30);

function Start(){
    console.log("Start()");

    staticObjects.push(new Box(150, 100, width * 0.6, 20, 0.3, true));
    staticObjects.push(new Box(250, 200, width * 0.6, 20, -0.3, true));
    staticObjects.push(new Box(200, 400, 350, 100, 0, true));
}

function Update(){
    for(var i = 0; i < dinamicObjects.length; i++){
        if (dinamicObjects[i].isOffScreen()) {
          dinamicObjects[i].removeFromWorld();
          dinamicObjects.splice(i, 1);
          i--;
        }
    }

    Engine.update(engine, 1000 / 30);
}

io.on('connection',function(socket){

    //sends info to all clients about the position of all dynamic objects
    setInterval(() => {
        var myObjects = [];
        for(var i = 0; i < dinamicObjects.length; i++){
            myObjects.push(dinamicObjects[i].getData());
        }
        io.emit('dynamicObjects', myObjects);
    }, 1000/30);

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayerID++,
            //x: randomInt(100,700),
            //y: randomInt(100,500)
        };

        var myStaticObjects = [];
        for(var i = 0; i < staticObjects.length; i++){
            myStaticObjects.push(staticObjects[i].getData());
        }
        io.emit('staticObjects', myStaticObjects);

/*
        var result = myArray.filter(function(v) {
          return v.id === '45'; // Filter out the appropriate one
        })[0].foo;
        */
/*
        var clients = io.sockets.clients(); // This returns an array with all connected clients
        for ( i = 0; i < clients.length; i++ ) {
            clients[i].emit('newplayer', socket.player);
        }
*/
        // sending to the client
        //socket.emit('newplayer', socket.player);

        // sending to all clients except sender
        //socket.broadcast.emit('addplayer', socket.player);

        console.log('player with id: ' + socket.player.id + ' connected at position: ( ' +
         socket.player.x  + ' , ' + socket.player.y + ' )');
    });

    socket.on('disconnect',function(){
      if (typeof socket.player != 'undefined'){
        socket.broadcast.emit('remove',socket.player.id);
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
        //io.sockets.emit('getallplayers', getAllPlayers());
        console.log("Received player " + socket.player.id + " mouse click at Pos: ( " + data.x + " , " + data.y + " )");
    });

});

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
    restitution: 0.95,
    isStatic: static
  }
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  World.add(world, this.body);

  this.isOffScreen = function() {
    var pos = this.body.position;
    return (pos.y > height + 100);
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
    restitution: 0.95,
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