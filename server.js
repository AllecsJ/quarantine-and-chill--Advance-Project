require('dotenv').config();

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var cluster = require('cluster');
var sticky = require('sticky-session');
var port = process.env.PORT || 3000;
var clients = 0;
users = [];
connections = [];
rooms = [];
// Store all of the sockets and their respective room numbers
userrooms = {}

YT3_API_KEY = process.env.YT3_API_KEY;
DM_API_KEY = process.env.DM_API_KEY;

// Set given room for url parameter
var given_room = ""

app.use(express.static(__dirname + '/'));

//for clustering
server.listen(port, function() {
  //starts the master server
  if (cluster.isMaster) {
    console.log(`Master server started on port ${port}`);
  } else {
    //shifts load to child server
    console.log(`- Child server started on port ${port}`);
  }
});




app.get('/:room', function(req, res) {
    given_room = req.params.room
    res.sendFile(__dirname + '/index.html');
});


var roomno = 1;

io.sockets.on('connection', function(socket) {
    // Connect Socket
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Set default room, if provided in url
    socket.emit('set id', {
        id: given_room
    })



    // reset url parameter
    // Workaround because middleware was not working right
    socket.on('reset url', function(data) {
        given_room = ""
    });

    // Disconnect
    socket.on('disconnect', function(data) {

        // If socket username is found
        if (users.indexOf(socket.username) != -1) {
            users.splice((users.indexOf(socket.username)), 1);
            updateUsernames();
        }

        connections.splice(connections.indexOf(socket), 1);
        console.log(socket.id + ' Disconnected: %s sockets connected', connections.length);


        // Grabs room from userrooms data structure
        var id = socket.id
        var roomnum = userrooms[id]
        var room = io.sockets.adapter.rooms['room-' + roomnum]

        // If you are not the last socket to leave
        if (room !== undefined) {
            // If you are the host
            if (socket.id == room.host) {
                // Reassign
                console.log("HOST SOCKET -> " + socket.id + " LEFT RESPONSIBILITY " + Object.keys(room.sockets)[0])
                io.to(Object.keys(room.sockets)[0]).emit('autoHost', {
                    roomnum: roomnum
                })
            }

            // Remove from users list
            // If socket username is found
            if (room.users.indexOf(socket.username) != -1) {
                room.users.splice((room.users.indexOf(socket.username)), 1);
                updateRoomUsers(roomnum);
            }
        }

        // Delete socket from userrooms
        delete userrooms[id]

    });

    // ------------------------------------------------------------------------
    // New room
    socket.on('new room', function(data, callback) {
        //callback(true);
        // Roomnum passed through
        socket.roomnum = data;

        // This stores the room data for all sockets
        userrooms[socket.id] = data

        var host = null
        var init = false

        // Sets default room value to 1
        if (socket.roomnum == null || socket.roomnum == "") {
            socket.roomnum = '1'
            userrooms[socket.id] = '1'
        }

        // Adds the room to a global array
        if (!rooms.includes(socket.roomnum)) {
            rooms.push(socket.roomnum);
        }

        // Checks if the room exists or not
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] === undefined) {
            socket.send(socket.id)
            // Sets the first socket to join as the host
            host = socket.id
            init = true

            // Set the host on the client side
            socket.emit('setHost');
            //console.log(socket.id)
        } else {
            console.log(socket.roomnum)
            host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
        }

        // Actually join the room
        console.log(socket.username + " connected to room-" + socket.roomnum)
        socket.join("room-" + socket.roomnum);

        // Sets the default values when first initializing
        if (init) {
            // Sets the host
            io.sockets.adapter.rooms['room-' + socket.roomnum].host = host
            // Default Player
            io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer = 0
            // Default video
            io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo = {
                yt: '7iZ3TjJxVp4',
                html5: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            }

            // Host username
            io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username
            // Keep list of online users
            io.sockets.adapter.rooms['room-' + socket.roomnum].users = [socket.username]
            //keep list of online rooms // test-aj
            io.sockets.adapter.rooms['room-' + socket.roomnum].rooms = [socket.rooms]
            console.log("test log - alex for active rooms", [socket.rooms]);

        }

        // Set Host label
        io.sockets.in("room-" + socket.roomnum).emit('changeHostLabel', {
            username: io.sockets.adapter.rooms['room-' + socket.roomnum].hostName
        })

        // Set Queue
        // updateQueueVideos()

        // Gets current video from room variable
        switch (io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer) {
            case 0:
                var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt
                break;
            case 1:
                var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.html5
                break;
            default:
                console.log("Error invalid player id")
        }
        var currYT = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt

        // Change the video player to current One
        switch (io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer) {
            case 0:
                // YouTube is default so do nothing
                break;
            case 1:
                io.sockets.in("room-" + socket.roomnum).emit('createHTML5', {});
                break;
            default:
                console.log("Error invalid player id")
        }

        // Change the video to the current one
        socket.emit('changeVideoClient', {
            videoId: currVideo
        });

        // Get time from host which calls change time for that socket
        if (socket.id != host) {
            //socket.broadcast.to(host).emit('getTime', { id: socket.id });
            console.log("call the host " + host)

            // Set a timeout so the video can load before it syncs
            setTimeout(function() {
                socket.broadcast.to(host).emit('getData');
            }, 1000);
            //socket.broadcast.to(host).emit('getData');

            // Push to users in the room
            io.sockets.adapter.rooms['room-' + socket.roomnum].users.push(socket.username)
        } else {
            console.log("I am the host")
        }

        // Update online users
        updateRoomUsers(socket.roomnum)


        //video sections
            socket.on("NewClient", function () {
                if (clients < 2) {
                    if (clients == 1) {
                        this.emit('CreatePeer')
                    }
                }
                else
                    this.emit('SessionActive')
                clients++;
            })
            socket.on('Offer', SendOffer)
            socket.on('Answer', SendAnswer)
            socket.on('disconnect', Disconnect)


        function Disconnect() {
            if (clients > 0) {
                if (clients <= 2)
                    this.broadcast.emit("Disconnect")
                clients--
            }
        }

        function SendOffer(offer) {
            this.broadcast.emit("BackOffer", offer)
        }

        function SendAnswer(data) {
            this.broadcast.emit("BackAnswer", data)
        }

      });
    // ------------------------------------------------------------------------



    // ------------------------------------------------------------------------
    // ------------------------- Socket Functions -----------------------------
    // ------------------------------------------------------------------------

    // Play video
    socket.on('play video', function(data) {
        var roomnum = data.room
        io.sockets.in("room-" + roomnum).emit('playVideoClient');
    });

    // Sync video
    socket.on('sync video', function(data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var currTime = data.time
            var state = data.state
            var videoId = data.videoId
            var playerId = io.sockets.adapter.rooms['room-' + roomnum].currPlayer
            // var videoId = io.sockets.adapter.rooms['room-'+roomnum].currVideo
            io.sockets.in("room-" + roomnum).emit('syncVideoClient', {
                time: currTime,
                state: state,
                videoId: videoId,
                playerId: playerId
            })
        }
    });


    // Change video
    socket.on('change video', function(data, callback) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var videoId = data.videoId
            var time = data.time
            var host = io.sockets.adapter.rooms['room-' + socket.roomnum].host

            // This changes the room variable to the video id
            // io.sockets.adapter.rooms['room-' + roomnum].currVideo = videoId
            switch (io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer) {
                case 0:
                    // Set prev video before changing

                    // Set new video id
                    io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt = videoId
                    break;

                case 1:
                    io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.html5 = videoId
                    break;
                default:
                    console.log("Error invalid player id")
            }

            io.sockets.in("room-" + roomnum).emit('changeVideoClient', {
                videoId: videoId
            });

            // If called from previous video, do a callback to seek to the right time
            if (data.prev) {
                // Call back to return the video id
                callback()
            }

        }
    });



    // Get video id based on player
    socket.on('get video', function(callback) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            // Gets current video from room variable
            switch (io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer) {
                case 0:
                    var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.yt
                    break;
                case 1:
                    var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.html5
                    break;
                default:
                    console.log("Error invalid player id")
            }
            // Call back to return the video id
            callback(currVideo)
        }
    })

    // Change video player
    socket.on('change player', function(data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var playerId = data.playerId

            io.sockets.in("room-" + roomnum).emit('pauseVideoClient');
            // console.log(playerId)
            switch (playerId) {
                case 0:
                    io.sockets.in("room-" + roomnum).emit('createYoutube', {});
                    break;
                case 1:
                    io.sockets.in("room-" + roomnum).emit('createHTML5', {});
                    break;
                default:
                    console.log("Error invalid player id")
            }

            // This changes the room variable to the player id
            io.sockets.adapter.rooms['room-' + roomnum].currPlayer = playerId
            // console.log(io.sockets.adapter.rooms['room-' + socket.roomnum].currPlayer)

            // This syncs the host whenever the player changes
            host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
            socket.broadcast.to(host).emit('getData')
        }

    })

    // Change video player
    socket.on('change single player', function(data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var playerId = data.playerId

            switch (playerId) {
                case 0:
                    socket.emit('createYoutube', {});
                    break;
                case 1:
                    socket.emit('createHTML5', {});
                    break;
                default:
                    console.log("Error invalid player id")
            }
            // After changing the player, resync with the host
            host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
            socket.broadcast.to(host).emit('getData')
        }
    })


    // Send Message in chat
    socket.on('send message', function(data) {
        var encodedMsg = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // console.log(data);
        io.sockets.in("room-" + socket.roomnum).emit('new message', {
            msg: encodedMsg,
            user: socket.username
        });
    });

    // New User
    socket.on('new user', function(data, callback) {
        callback(true);
        // Data is username
        var encodedUser = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        socket.username = encodedUser;
        //console.log(socket.username)
        users.push(socket.username);
        updateUsernames();
    });



    // This just calls the syncHost function
    socket.on('sync host', function(data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            //socket.broadcast.to(host).emit('syncVideoClient', { time: time, state: state, videoId: videoId });
            var host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
            // If not host, recall it on host
            if (socket.id != host) {
                socket.broadcast.to(host).emit('getData')
            } else {
                socket.emit('syncHost')
            }
        }
    })

    // Emits the player status
    socket.on('player status', function(data) {
        // console.log(data);
        console.log("player status: ", data)
    });

    // Change host
    socket.on('change host', function(data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])
            var roomnum = data.room
            var newHost = socket.id
            var currHost = io.sockets.adapter.rooms['room-' + socket.roomnum].host

            // If socket is already the host!
            if (newHost != currHost) {
                console.log("I want to be the host and my socket id is: " + newHost);
                //console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])

                // Broadcast to current host and set false
                socket.broadcast.to(currHost).emit('unSetHost')
                // Reset host
                io.sockets.adapter.rooms['room-' + socket.roomnum].host = newHost
                // Broadcast to new host and set true
                socket.emit('setHost')

                io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username
                // Update host label in all sockets
                io.sockets.in("room-" + roomnum).emit('changeHostLabel', {
                    username: socket.username
                })
                // Notify alert
                socket.emit('notify alerts', {
                    alert: 1,
                    user: socket.username
                })
            }
        }
    })

    // Get host data
    socket.on('get host data', function(data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var host = io.sockets.adapter.rooms['room-' + roomnum].host

            // Broadcast to current host and set false
            // Call back not supported when broadcasting

            // Checks if it has the data, if not get the data and recursively call again
            if (data.currTime === undefined) {
                // Saves the original caller so the host can send back the data
                var caller = socket.id
                socket.broadcast.to(host).emit('getPlayerData', {
                    room: roomnum,
                    caller: caller
                })
            } else {
                var caller = data.caller
                // Call necessary function on the original caller
                socket.broadcast.to(caller).emit('compareHost', data);
            }
        }

    })

    // Calls notify functions
    socket.on('notify alerts', function(data) {
        var alert = data.alert
        console.log("entered notify alerts")
        var encodedUser = ""
        if (data.user) {
            encodedUser = data.user.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }

        if (alert = 1) {
          io.sockets.in("room-" + socket.roomnum).emit('changeHostNotify', {
              user: encodedUser
          })
        }else{
          console.log("Error alert id")
        }
    })

    //------------------------------------------------------------------------------
    // Async get current time
    socket.on('auto sync', function(data) {
        var async = require("async");
        var http = require("http");

        //Delay of 5 seconds
        var delay = 5000;

        async.forever(

            function(next) {
                console.log("i am auto syncing")
                socket.emit('syncHost');

                //Repeat after the delay
                setTimeout(function() {
                    next();
                }, delay)
            },
            function(err) {
                console.error(err);
            }
        );
    });


    // Some update functions --------------------------------------------------
    // Update all users
    function updateUsernames() {

    }

    // Update the room usernames
    function updateRoomUsers(roomnum) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomUsers = io.sockets.adapter.rooms['room-' + socket.roomnum].users
            io.sockets.in("room-" + roomnum).emit('get users', roomUsers)
        }
    }



})
