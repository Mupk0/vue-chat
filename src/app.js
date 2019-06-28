const socket = io();

// Message Component
Vue.component('message', {
    props: ['messageData'],
    template: ` <div class="row comments mb-2">
                  <div class="col-md-9 col-sm-9 col-9 comment rounded mb-2">
                    <h4 class="m-0">{{messageData.user}}</h4>
                    <time class="text-white ml-3">{{messageData.date}}</time>
                    <p class="mb-0 text-white">{{messageData.text}}</p>
                  </div>
                </div>`
});

// Input message Component
Vue.component('input-message', {
    data: function () {
        return {
            message: ''
        };
    },
    template: ` <div class="row comment-box-main p-3 rounded-bottom">
                        <div class="col-md-9 col-sm-9 col-9 pr-0 comment-box">
                            <input v-model="message" v-on:keydown.enter="send" class="form-control" placeholder="Write message">
                        </div>
                        <div class="col-md-3 col-sm-2 col-2 pl-0 text-center send-btn">
                            <button v-on:click="send" :disabled="!message" class="btn btn-info">Send</button>
                        </div>
                    </div>`,
    methods: {
        send: function () {
            if (this.message.length > 0) {
                this.$emit('send-message', this.message);
                this.message = '';
            }
        }
    }
});

// Input user name Component
Vue.component('input-name', {
    props: ['isLogged'],
    data: function () {
        return {
            userName: ''
        };
    },
    template: `<div id="nameInput" v-show="!isLogged">
                        <div class="field is-grouped">
                            <div class="control">
                                <input v-model="userName" v-on:keydown.enter="sendUserName" class="input is-primary" placeholder="Your name">
                            </div>
                            <div class="control">
                                <button v-on:click="sendUserName" :disabled="!userName" class="button is-primary">Enter</button>
                            </div>
                        </div>
                    </div>`,
    methods: {
        sendUserName: function () {
            if (this.userName.length > 0) {
                this.$emit('set-name', this.userName);
            }
        }
    }
});

// Users component
Vue.component('users', {
    props: ['users'],
    template: ` <div class="users">
                        <h4 class="title is-4">Online ({{users.length}}) users</h4>
                        <ul>
                            <li v-for="user in users">
                                <div class="media-content">
                                    <div class="content">
                                        <p>
                                            {{user.name}}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>`
});

// Rooms component
Vue.component('rooms', {
    props: ['rooms'],
    template: ` <div class="rooms">
                        <h4 class="title is-4">Available ({{rooms.length}}) rooms</h4>
                        <ul>
                            <li v-for="room in rooms">
                                <div class="media-content">
                                    <div class="content">
                                        <p>
                                            {{room}}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>`
});

// Input room name Component
Vue.component('input-room', {
    data: function () {
        return {
            roomName: ''
        };
    },
    template: `<div id="roomInput">
                        <div class="field is-grouped">
                            <div class="control">
                                <input v-model="roomName" v-on:keydown.enter="createRoomName" class="input is-primary" placeholder="Room name">
                            </div>
                            <div class="control">
                                <button v-on:click="createRoomName" :disabled="!roomName" class="button is-primary">Create</button>
                            </div>
                        </div>
                    </div>`,
    methods: {
        createRoomName: function () {
            if (this.roomName.length > 0) {
                this.$emit('create-room', this.roomName);
            }
        }
    }
});

//Input room name Component
Vue.component('change-button', {
    data: function () {
        return {
            roomToChange: ''
        };
    },
    template: `<div id="roomInput">
                        <div class="field is-grouped">
                            <div class="control">
                                <input v-model="roomToChange" v-on:keydown.enter="changeRoomName" class="input is-primary" placeholder="Direct Room">
                            </div>
                            <div class="control">
                                <button v-on:click="changeRoomName" class="button is-primary">Enter Room</button>
                            </div>
                        </div>
                    </div>`,
    methods: {
        changeRoomName: function () {
            this.$emit('change-room', this.roomToChange);
        }
    }
});

// Vue instance
var app = new Vue({
    el: '#app',
    data: {
        messages: [],
        users: [],
        rooms: [],
        userName: '',
        isLogged: false
    },
    methods: {
        sendMessage: function (message) {
            if (message) {
                socket.emit('send-msg', {message: message, user: this.userName});
            }
        },
        setName: function (userName) {
            this.userName = userName;
            this.isLogged = true;
            socket.emit('add-user', this.userName);
        },
        createRoom: function (roomName) {
            this.roomName = roomName;
            socket.emit('add-room', this.roomName);
        },
        changeRoom: function (roomToChange) {
            this.roomToChange = roomToChange;
            socket.emit('change-room', this.roomToChange);
        },
        scrollToEnd: function () {
            var container = this.$el.querySelector('.messages');
            // console.log(container);
            // console.log(this.$el);
            container.scrollTop = container.scrollHeight;
        }
    },
    updated() {
        this.scrollToEnd();
    }
});

// Client Socket events

// When the server emits a message, the client updates message list
socket.on('read-msg', function (message) {
    app.messages.push({text: message.text, user: message.user, date: message.date});
});

// When user connects, the server emits user-connected event which updates user list
socket.on('user-connected', function (userId) {
    app.users.push(userId);
});

// Init chat event. Updates the initial chat with current messages
socket.on('init-chat', function (messages) {
    app.messages = messages;
});

// Init user list. Updates user list when the client init
socket.on('update-users', function (users) {
    app.users = users;
});

socket.on('update-rooms', function (rooms) {
    app.rooms = rooms;
});
