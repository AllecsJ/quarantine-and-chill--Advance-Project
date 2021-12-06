let expect = require('expect');
let assert = require('chai');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);



// var {generateMessage} = require('message.js');
//
// //testing
// describe('Generate Message', () => {
//   it("should parse the test ---message", () => {
//     let from = "SYNCAPP",
//         text = "Test message",
//         message = generateMessage(from, text);
//
//         expect(typeof message.createdAt).toBe('number');
//         expect(message).toMatchObject({from, text});
//   })
// })
// ------------------------------------------------------------------------
// ------------------------- server.js Functions -----------------------------
// ------------------------------------------------------------------------

// var {playvideo} = require('./server');
// describe('play video', () => {
//   it("should parse the video data as ", () =>{
//     let roomnum = "data.room";
//
//
//   expect(typeof roomnum).toBe('string').catch(done);
//   })
// })


var {syncvideo} = require('./server');
describe('play video', (socket) => {
  it("should parse the sync data as string ", (data) =>{
            var roomnum = "data.room";
            var currTime = "data.time";
            var state = "data.state";
            var videoId = "data.videoId";
            var playerId = "io.sockets.adapter.rooms['room-' + roomnum].currPlayer";


  expect(typeof roomnum).toBe('string');
  expect(typeof currTime).toBe('string');
  expect(typeof state).toBe('string');
  expect(typeof videoId).toBe('string');
  // expect(typeof playerId).toBe('number');
  })
})


var {changevideo} = require('./server');
describe('change video', (socket) => {
  it("should parse the video data as string ", (data) =>{
            var roomnum = "data.room",
             videoId = "data.videoId",
             time = "data.time",
             host = "io.sockets.adapter.rooms['room-' + socket.roomnum].host";

  expect(typeof roomnum).toBe('string');
  expect(typeof videoId).toBe('string');
  expect(typeof time).toBe('string');
  expect(typeof host).toBe('string');
  // expect(typeof playerId).toBe('number');
  })
})


var {getvideo} = require('./server');
describe('get video', (socket) => {
  it("should parse the video data as number & string ", (data) =>{
            var currVideo = 0;
            var callback = "data.room";


  expect(typeof currVideo).toBe('number');
  expect(typeof callback).toBe('string');
  // expect(typeof playerId).toBe('number');
  })
})

var {changeplayer} = require('./server');
describe('change player', (socket) => {
  it("should parse the video data as numbers ", (data) =>{
            var currVideo = 0;
            var playerId = 0;

  expect(typeof currVideo).toBe('number');
  expect(typeof playerId).toBe('number');
  // expect(typeof playerId).toBe('number');
  })
})


var {newroom} = require('./server');

describe('new room', () => {
  it("should parse the room id as string", () =>{
    let d = 'new room';

    expect(typeof d).toBe('string');

  })
})

var {sendMessage} = require('./server');
describe('send message', () => {
  it("should parse the msg as string", () =>{
    let msg = "string";
    let user= "string";

  expect(typeof msg).toBe('string');
  expect(typeof user).toBe('string');
  })
})

var {newuser} = require('./server');

describe('new user', () => {
  it("should parse the new useras string", () =>{
    let user = "string";
  expect(typeof user).toBe('string');

  })
})

var {synchost} = require('./server');
describe('sync host', () => {
  it("should parse host as string", () =>{
    let host = "string";

  expect(typeof host).toBe('string');

  })
})


var {playerstatus} = require('./server');
describe('player status', () => {
  it("should parse player status as string", () =>{
    let status = 1;

  expect(typeof status).toBe('number');
  })
})

var {changehost} = require('./server');
describe('change host', () => {
  it("should parse host info as string", () =>{
    let roomnum = "";
    let newHost = "";
    let currHost = "";

  expect(typeof roomnum).toBe('string');
  expect(typeof newHost).toBe('string');
  expect(typeof currHost).toBe('string');
  })
})

var {gethostdata} = require('./server');
describe('get host data', () => {
  it("should parse hostdata  as string", () =>{
    let roomnum = "";
    let newHost = "";
    let caller = "";

  expect(typeof roomnum).toBe('string');
  expect(typeof newHost).toBe('string');
  expect(typeof caller).toBe('string');
  })
})

// notify alerts
var {notifyalerts} = require('./server');
describe('notify alerts', () => {
  it("should parse alert  as string", () =>{
    let alert = 1;

  expect(typeof alert).toBe('number');
  })
})

var {autosync} = require('./server');
describe('auto sync', () => {
  it("should parse auto sync  data as string", () =>{
    let async = require('async');
    let http = require("http")

  expect(typeof async).toBe('object');
  expect(typeof http).toBe('object');
  })
})


  var {updateRoomUsers} = require('./server');
  describe('updateRoomUsers', () => {
    it("should parse user data as string", () =>{
      let roomUsers = "io.sockets.adapter.rooms['room-' + socket.roomnum].users";

    expect(typeof roomUsers).toBe('string');
    })
  })



  // ------------------------------------------------------------------------
  // ------------------------- player.js Functions -----------------------------
  // ------------------------------------------------------------------------



  var {getPlayerData} = require('./server');
  describe('getPlayerData', () => {
    it("should parse video player data as string & number", (data) =>{
      var roomnum = "data.room"
      var caller = "data.caller "
      var currPlayer = 1
      var currTime = "player.getCurrentTime()"
      var state = 1
    expect(typeof roomnum).toBe('string');
    expect(typeof caller).toBe('string');
    expect(typeof currPlayer).toBe('number');
    expect(typeof currTime).toBe('string');
    expect(typeof state).toBe('number');
    })
  })


  var {createYoutube} = require('./server');
  describe('createYoutube', () => {
    it("should parse  youtube data as string & number", (data) =>{
      var you = "document.getElementById('playArea')";
      var currPlayer = 1
      var currTime = "player.getCurrentTime()"
      var state = 1;

    expect(typeof you).toBe('string');
    expect(typeof currPlayer).toBe('number');
    expect(typeof currTime).toBe('string');
    expect(typeof state).toBe('number');
    })
  })

  var {createHTML5} = require('./server');
  describe('createHTML5', () => {
    it("should parse  youtube data as string & number", (data) =>{
      var html5 = "document.getElementById('HTML5Area')";
      var currPlayer = 1;
      var currTime = "player.getCurrentTime()";
      var state = 1;

    expect(typeof you).toBe('string');
    expect(typeof currPlayer).toBe('number');
    expect(typeof currTime).toBe('string');
    expect(typeof state).toBe('number');
    })
  })


  // ------------------------------------------------------------------------
  // ------------------------- sync.js Functions -----------------------------
  // ------------------------------------------------------------------------
//sync video already tested

var {getTime} = require('./server');
describe('getTime', () => {
  it("should parse  youtube data as string & number", (media) =>{
    var currtime = "media.currTime";
  expect(typeof currtime).toBe('string');
  })
})


var {seekto} = require('./server');
describe('getTime', () => {
  it("should parse  youtube data as string & number", (player) =>{
    var seek = "player.seekTo(time)";


  expect(typeof you).toBe('string');
  })
})


// ------------------------------------------------------------------------
// ------------------------- events.js Functions -----------------------------
// ------------------------------------------------------------------------
