/* jslint node: true */
"use strict";

var model = require('./model.js');

module.exports = function (socket, io) {
  // user joins room
  socket.on('join', function (req) {
    if(req.previous !== "") {
      socket.leave(req.previous)
      console.log(req.username + " left " + req.previous);
    }
    console.log(req.username + " joined " + req.security);
    var security = req.security;
    socket.nickname = req.username;
    socket.join(security);
  });

  // user gets updated
  socket.on('update', function (req) {
    console.log("update to " + req.security);
    io.to(req.security).emit('update', req.data);
  });


  // user leaves room
  socket.on('leave', function (req) {
    console.log(req);
    var name = req.name;
    var user = req.user;
    var room = model.findRoom(name);
    // room.removeUser(user);
    console.log('A user left ' + name);
    io.to(name).emit('leave', user);
  });
};
