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
var width = 400;
var height = 400;

var Engine = Matter.Engine,
  // Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies;

var engine = Engine.create();
var world = engine.world;

//var boxA = Bodies.rectangle(400, 200, 80, 80);
//var boxB = Bodies.rectangle(450, 50, 80, 80);
//var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

//World.add(engine.world, [boxA, boxB, ground]);

//console.log('boxA', boxA.position);
//console.log('boxB', boxB.position);

Start();
setInterval(function(){Update();}, 1000/30);

function Start(){
    staticObjects.push(new Boundary(150, 200, width * 0.6, 20, 0.3));
    staticObjects.push(new Boundary(250, 300, width * 0.6, 20, -0.3));

    //socket.emit('servermessage', "This is the Start()");
    console.log("This is the Start()");
}

function Update(){
    var message = Math.floor(Math.random() * 10000);
    //socket.emit('servermessage', message + " This is the Update()");
    //console.log("dinamicObjects.length: " + dinamicObjects.length);
    for(var i = 0; i < dinamicObjects.length; i++){
        //console.log(dinamicObjects[i].body.position);
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
        dinamicObjects.push(new Circle(data.x, data.y, randomIntFromInterval(5, 10)));
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

function Circle(x, y, r) {
  var options = {
    friction: 0,
    restitution: 0.95
  }
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  World.add(world, this.body);

  this.isOffScreen = function() {
    var pos = this.body.position;
    return (pos.y > height + 100);
  }

  this.removeFromWorld = function() {
    World.remove(world, this.body);
  }

  this.getData = function(){
    var data = {
      posX: this.body.position.x,
      posY: this.body.position.y,
      angle: this.body.angle,
      r: this.r
    }
    return data;
  }
}

function Boundary(x, y, w, h, a) {
  var options = {
    friction: 0,
    restitution: 0.95,
    angle: a,
    isStatic: true
  }
  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  World.add(world, this.body);

  this.getData = function(){
    var data = {
      posX: this.body.position.x,
      posY: this.body.position.y,
      w: this.w,
      h: this.h,
      angle: this.body.angle,
    }
    return data;
  }
}