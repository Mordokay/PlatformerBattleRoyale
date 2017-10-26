var Client = {};

Client.socket = io.connect('46.189.166.52:25565');

Client.socket.on('connect_error', function() {
    console.log('Failed to connect to server');
});

//This is what the client sends to the server
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
Client.socket.on('playerNetworkID',function(id){
    Game.setPlayerNetworkId(id);
});

Client.socket.on('initialElements',function(dataString){
    Game.initializeElements(dataString);    
});

Client.socket.on('addElement',function(dataString){
    Game.addElement(dataString);
    //console.log("addElement");
    //console.log(dataString);
});

Client.socket.on('serverData',function(dataString){
    Game.processData(dataString);
});

Client.socket.on('removeElement',function(elementID){
    Game.removeElement(elementID);
});