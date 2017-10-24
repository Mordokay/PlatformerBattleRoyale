var Client = {};

Client.socket = io.connect('46.189.166.52:25565');

Client.socket.on('connect_error', function() {
    console.log('Failed to connect to server');
});

//This is what the client sends to the server
Client.sendTest = function(){
    Client.socket.emit('test');
};

Client.Left = function(isLeftDown){
    if(isLeftDown){
        Client.socket.emit('L_DOWN');
    }
    else{
        Client.socket.emit('L_UP');
    }
};
Client.Right = function(isRightDown){
    if(isRightDown){
        Client.socket.emit('R_DOWN');
    }
    else{
        Client.socket.emit('R_UP');
    }
};
Client.Jump = function(data){
    Client.socket.emit('J');
};

Client.sendMouseClick = function(data){
	//console.log("Sent mouse click at Pos: ( " + data.x + " , " + data.y + " )");
    Client.socket.emit('mouseClick', data);
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.getAllPlayers = function(){
    Client.socket.emit('getallplayers');
};

//This is what the client recieves from the server
Client.socket.on('playerID',function(id){
    Game.setPlayerId(id);
});

Client.socket.on('playerPos',function(data){
    Game.setPlayerPos(data);
});

Client.socket.on('staticObjects',function(data){
    Game.setStaticObjects(data);
});

Client.socket.on('dinamicObjects',function(data){
    Game.setDinamicObjects(data);
});

Client.socket.on('playerObjects',function(data){
    Game.setPlayerObjects(data);
});

Client.socket.on('servermessage',function(message){
    console.log(message);
});