var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
users = [];
messages = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server Running...');



app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket)=>{
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Disconect
    socket.on('disconnect', (data)=>{
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    //Send Message
    socket.on('send message', (data)=>{
        messages.push({msg: data, user: socket.username});
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    //New User
    socket.on('new user', (data, callback)=>{
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
        updatechat();
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }

    function updatechat(){
        io.sockets.emit('get messages', messages);
    }

});