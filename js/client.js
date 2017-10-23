var Client = {};

Client.socket = io.connect('46.189.166.52:25565');

Client.socket.on('connect_error', function() {
    console.log('Failed to connect to server');
});

//This is what the client sends to the server
Client.sendTest = function(){
	console.log("Some log for chrome!!!");
    Client.socket.emit('test');
};

Client.sendMouseClick = function(data){
	console.log("Sent mouse click at Pos: ( " + data.x + " , " + data.y + " )");
    Client.socket.emit('mouseClick', data);
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.askDinamicObjects = function(){
    Client.socket.emit('getDinamicObjects');
};

Client.getAllPlayers = function(){
    Client.socket.emit('getallplayers');
};

//This is what the client recieves from the server
Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data);
});

Client.socket.on('staticObjects',function(data){
    Game.setStaticObjects(data);
});

Client.socket.on('dynamicObjects',function(data){
    Game.setDinamicObjects(data);
});

Client.socket.on('servermessage',function(message){
    console.log(message);
});