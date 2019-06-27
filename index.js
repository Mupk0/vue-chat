const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const path = `${__dirname}/src/`;

app.get('/', (req, res) => {
    res.sendFile(path + '/index.html');
});

let messages = [];
let users = [];

io.on('connection', (socket) => {
    socket.room = 'Lobby';
    //users.push(socket.id);

    socket.emit('init-chat', messages);
    socket.emit('update-users', users);

    socket.on('send-msg', data => {
        let newMessage = { text : data.message, user : data.user, date : new Date().toLocaleString() };
        messages.push(newMessage);
        io.emit('read-msg', newMessage);
    });

    socket.on('add-user', user => {
        users.push({ id: socket.id, name: user });
        io.emit('update-users', users);
    });

    socket.on('disconnect', () => {
        users = users.filter(function(user){
            return user.id !== socket.id;
        });
        io.emit('update-users', users);
    });

    // socket.join('Lobby room', () => {
    //     let rooms = Object.keys(socket.rooms);
    //     console.log(rooms); // [ <socket.id>, 'room 237' ]
    // });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

app.use(express.static(`${__dirname}/src`));
app.use('/npm', express.static('node_modules'));