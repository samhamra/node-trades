/* jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var model = require("./model.js");

router.get('/roomlist', function (req, res) {
  var rooms = model.getRooms();
  var roomNames = [];
  for (var i = 0; i < rooms.length; i++) {
    roomNames.push(rooms[i]);
  }
  res.json({list:roomNames});
});

router.get('/securities', function(req, res) {
  model.getSecurities(function(result) {
    res.json({list: result})
  })
});

router.post('/securities', function(req, res) {
  model.createSecurity(req.body.name);
  console.log("Security created " + req.body.name);
  res.json({security: req.body.name});
});

router.post('/orders', function(req, res) {
  model.matchOrder(req.body, function(result) {
    res.json(result);
  })
});

router.get('/trades/:security', function(req, res) {
  model.getTrades(req.params.security, function(result) {
    res.json({trades: result})

  });
});

router.get('/room/:room', function (req, res) {
  var messages = model.findRoom(req.params.room).messages;
  res.json({list: messages});
});

router.post('/setUser', function (req, res) {
  res.json({name:"Anon"});
});

module.exports = router;
