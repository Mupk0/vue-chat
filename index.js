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
let rooms = ['Lobby'];

io.on('connection', (socket) => {
    socket.room = rooms[0];

    socket.emit('init-chat', messages);
    socket.emit('update-users', users);
    socket.emit('update-rooms', rooms);

    socket.on('send-msg', data => {
        let newMessage = {text: data.message, user: data.user, date: new Date().toLocaleString()};
        messages.push(newMessage);
        io.emit('read-msg', newMessage);
    });

    socket.on('add-user', user => {
        const checkUserName = users.some(users => users.name === user);
        if (checkUserName) {
            console.log('This user name has been used')
        }
        users.push({id: socket.id, name: user});
        console.log('User ' + user + ' connected to Lobby')
        io.emit('update-users', users);

    });

    socket.on('disconnect', () => {
        users = users.filter(function (user) {
            return user.id !== socket.id;
        });
        io.emit('update-users', users);
    });

    socket.on('add-room', room => {
        if (!rooms.includes(room)) {
            rooms.push(room);
        } else {
            console.log('This name has been used')
        }
        io.emit('update-rooms', rooms);
    });

    socket.on('change-room', room => {
        if (rooms.includes(room)) {
            socket.join(room, () => {
                socket.room = room;
                const clients = io.sockets.adapter.rooms[room];
                console.log('in ' + room + ' room ' + clients.length + ' users');
            });
        } else {
            console.log('Room undefined');
        }
        //io.emit('update-rooms', rooms);
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

app.use(express.static(`${__dirname}/src`));
app.use('/npm', express.static('node_modules'));