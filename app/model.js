/* jslint node: true */
"use strict";

var Sequelize = require('sequelize');
var sequelize = new Sequelize('shamra', 'shamra_admin', 'rOVAeCpn', {
  host: 'mysql-vt2016.csc.kth.se',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }});
  sequelize.authenticate().then(function(err) {
    console.log('Connection to database has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

  var Securities = sequelize.define('securities', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    name: { type: Sequelize.STRING}
  }, {
    tableName: 'securities',
    timestamps: false
  });
  Securities.sync();

  var Orders = sequelize.define('orders', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    name: { type: Sequelize.STRING},
    type: { type: Sequelize.STRING},
    price: { type: Sequelize.FLOAT},
    amount: { type: Sequelize.INTEGER},
    uid: { type: Sequelize.STRING}
  }, {
    tableName: 'orders',
    timestamps: false
  });
  Orders.sync();

  var Trades = sequelize.define('trades', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    price: { type: Sequelize.FLOAT},
    amount: { type: Sequelize.INTEGER},
    security: { type: Sequelize.STRING},
    buyer: { type: Sequelize.STRING},
    seller: { type: Sequelize.STRING}
  }, {
    tableName: 'trades'
  });
  Trades.sync();

  /**
  * A module that contains the main system object!
  * @module roomSystem
  */

  var roomList = [];

  exports.getTrades = function(security, callback) {
    var trades = [];
    Trades.findAll(
      {attributes: ['security', 'price', 'amount', 'buyer', 'seller', 'createdAt' ],
      where: {security: security}}
    ).then(function(result) {
      result.forEach(function(row) {
        trades.push({security: row.get('security'), price: row.get('price'), amount: row.get('amount'), buyer: row.get('buyer'), seller: row.get('seller'), createdAt: row.get('createdAt')});
      })
      console.log("Trades sent");
      callback(trades);
    });
  }
  exports.getSecurities = function(callback) {
    var securityList = [];
    Securities.findAll({attributes: ['name']}).then(function(result) {
      result.forEach(function(row) {
        var name = row.get('name');
        securityList.push(name);
      })
      console.log("Securities sent");
      callback(securityList);
    })
  }
  exports.createSecurity = function(sname) {
    console.log("Security created");
    Securities.create({
      name: sname
    });
  }

  exports.matchOrder = function(data, callback) {
    var resultList = [];
    Orders.findAndCountAll({
      where: {
        price: data.price,
        name: data.security,
        type: {$ne: data.type}
      },
      order: 'id ASC'

    }).then(function (result) {
      //console.log(result.count);
      for(var row of result.rows) {
        var diff = data.amount-row.get('amount');
        if(diff > 0) {  // Köparen vill köpa mer, skapa trade, ta bort sälj order, minska värden för köparen och fortsätt matcha
          if(data.type === 'Buy') {
            createTrade(data.security, data.price, row.get('amount'), data.uid, row.get('uid'));
            resultList.push({security: data.security, price: data.price, amount: row.get('amount'), buyer: data.uid, seller: row.get('uid')});
          } else {
            createTrade(data.security, data.price, row.get('amount'), row.get('uid'), data.uid);
            resultList.push({security: data.security, price: data.price, amount: row.get('amount'), buyer: row.get('uid') , seller: data.uid});
          }
          deleteOrder(row.get('id'));
          data.amount = diff;
        } else if(diff < 0) { //Säljaren ville sälja mer
          if(data.type === 'Buy') {
            createTrade(data.security, data.price, data.amount, data.uid, row.get('uid'));
            resultList.push({security: data.security, price: data.price, amount: data.amount, buyer: data.uid , seller: row.get('uid')});
          } else {
            createTrade(data.security, data.price, data.amount, row.get('uid'), data.uid);
            resultList.push({security: data.security, price: data.price, amount: data.amount, buyer: row.get('uid'), seller: data.uid });
          }
          updateOrder(row.get('id'), Math.abs(diff));
          data.amount = 0;
          break;
        } else {
          if(data.type === 'Buy') {
            createTrade(data.security, data.price, data.amount, data.uid, row.get('uid'));
            resultList.push({security: data.security, price: data.price, amount: data.amount, buyer: data.uid, seller: row.get('uid') });
          } else {
            createTrade(data.security, data.price, data.amount, row.get('uid'), data.uid);
            resultList.push({security: data.security, price: data.price, amount: data.amount, buyer: row.get('uid'), seller: data.uid });
          }
          deleteOrder(row.get('id'));
          data.amount = 0;
          break;
        }
      }
      if(data.amount !== 0) {
        createOrder(data);
      } else {
        console.log("Full buy matched and performed")
      }
      callback(resultList);
    })
  }

  function createOrder(data) {
    console.log("Order created");
    Orders.create({
      name: data.security,
      type: data.type,
      price: data.price,
      amount: data.amount,
      uid: data.uid,
    });

  }
  function updateOrder(id, amount) {
    console.log("Order updated");
    Orders.update(
      {amount: amount},
      {
        where: {id: id}
      });
    }
    function deleteOrder(id) {
      console.log("Order deleted");
      Orders.destroy({
        where: {
          id: id
        }
      });
    }
    function createTrade(security, price, amount, buyer, seller) {
      console.log("Trade created");
      Trades.create({
        security: security,
        price: price,
        amount: amount,
        buyer: buyer,
        seller: seller
      });
    }

    function Room(name) {
      this.name = name;
      this.messages = [];
      this.users = [];

      this.addMessage = function(message){
        this.messages.push(message);
      };
    }


    /**
    * Creates a room with the given name.
    * @param {String} name - The name of the room.
    */
    exports.addRoom = function (name) {
      var newRoom = new Room(name);
      roomList.push(newRoom);
    };

    /**
    * Returns all the Rooms.
    */
    exports.getRooms = function() {
      return roomList;
    };

    /**
    * Removes the room object with the matching name.
    * @param {String} name - The name of the room.
    */
    exports.removeRoom = function(name){
      for (var i = 0; i < roomList.length; i++) {
        var room = roomList[i];
        if (room.name === name) {
          roomList.splice(i, 1);
          room.remove();
          break;
        }
      }
    };

    /**
    * Return the room object with the matching name.
    * @param {String} name - The name of the room.
    */
    exports.findRoom = function(name) {
      for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].name === name) {
          return roomList[i];
        }
      }
    };
