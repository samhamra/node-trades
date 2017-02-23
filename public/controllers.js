var chattControllers = angular.module('chattControllers', []);
var stockControllers = angular.module('stockControllers', [])

chattControllers.controller('listController', ['$scope', '$location',  'HttpService',
function($scope, $location, http) {

  $scope.rooms = [];
  http.get("/roomList", function(data) {
    $scope.rooms = data.list;
  });
  $scope.redirect = function(room) {
    console.log("Trying to enter room : " + room.name);
    $location.hash("");
    $location.path('/room/' + room.name);
  };
}
]);

chattControllers.controller('roomController', ['$scope', 'HttpService', '$routeParams', 'UserService',
function($scope, http, $routeParams, user) {
  $scope.room = $routeParams.room;
  $scope.mess = "";
  $scope.entries = [];
  // $scope.entries = ["always", "leaving", "from", "recieve", "me", "down"];
  http.get("/room/"+$scope.room, function(data) {
    $scope.entries = data.list;
    socket.emit("join", {name:$scope.room, username: user.getName()});
  });
  var socket = io().connect();

  socket.on('update', function (data) {
    $scope.$apply(function(){
      console.log("update");
      console.log(data);
      $scope.entries.push(data.username + ": " + data.update);
    });
  });

  socket.on('join', function (data) {
    $scope.$apply(function(){
      console.log("join");
      console.log(data);
      $scope.entries.push(data.username + " joined the channel");
    });
  });

  $scope.redirect = function(room) {
    console.log("Trying to enter room : " + room.name);
    $location.hash("");
    $location.path('/room/' + room.name);
  };

  $scope.done = function() {
    console.log("Reached done()");
    socket.emit("update", {room:$scope.room, update:$scope.mess, username:user.getName()});
    $scope.mess = "";
  };

}
]);

stockControllers.controller('tradeController', ['$scope', 'HttpService', 'UserService',
function($scope, http, user) {
  $scope.availableSecurities;
  $scope.selectedSecurity;
  $scope.previousRoom;
  $scope.trades;
  $scope.orders;
  var socket = io().connect();
  socket.on('connect', function(){
    console.log("connected to socket")
    //socket.emit("join", {security: $scope.selectedSecurity});
  })
  http.get("/securities", function(response) {
    $scope.availableSecurities = response.data.list;
  });
  $scope.getTrades = function (selectedSecurity, previousSecurity) {
    console.log("previous: " + previousSecurity);
    console.log("current: " + selectedSecurity)
    http.get("/trades/"+selectedSecurity, function(result) {
      $scope.trades = result.data.trades;
      $scope.orders = result.data.orders;
      socket.emit("join", {security: $scope.selectedSecurity, previous: previousSecurity, username:user.getName()});
    });
  }
  socket.on('update', function(data) {
    console.log("updated trades");
    console.log(data.trades);
    data.trades.forEach(function(object) {
      $scope.$apply(function(){
        $scope.trades.push(object);
      })
    })
    http.get("/orders/" + $scope.selectedSecurity, function(result) {
      console.log("updated orders");
      console.log(result.data);
      console.log(result.data.orders);
      $scope.orders = result.data.orders;
    });
  })

}
]);


chattControllers.controller('aboutController', ['$scope',
function($scope) {

}
]);
stockControllers.controller('securityController', ['$scope', 'HttpService',
function($scope, http) {
  $scope.createSecurity = function(name) {
    var data = {'name': name};
    http.post('/securities', data, function(response) {
      console.log("Security named " + response.data.security + " created!");
    });
    $scope.securityName = "";
  }
}
]);
stockControllers.controller('orderController', ['$scope', 'HttpService', 'UserService',
function($scope, http, user) {
  $scope.availableSecurities;
  $scope.selectedSecurity;
  $scope.types = ['Buy', 'Sell'];
  $scope.price = 1;
  $scope.amount = 1;
  console.log("ok");
  var socket = io().connect();
  socket.on('connect', function(){
    console.log("connected to socket")
  })
  http.get("/securities", function(response) {
    console.log(response.data.list);
    $scope.availableSecurities = response.data.list;
    $scope.selectedSecurity = $scope.availableSecurities[0];
  });

  $scope.createOrder = function () {
    if(user.getName() === "") {
      alert("You need to be logged in to make an order")
    } else {
      var data = {security: $scope.selectedSecurity, type: $scope.type, price: $scope.price, amount: $scope.amount, uid: user.getName()};
      http.post("/orders", data, function(response) {
        console.log(response.data.trades);
        console.log(response.data.orders);
        console.log("emit update");
        socket.emit('update', {security: data.security, trades: response.data.trades, orders: response.data.orders});

      })
    }
  }

}
]);




chattControllers.controller('loginController', ['$scope', 'HttpService', '$location', 'UserService',
function($scope, http, $location, user) {
  $scope.name = "";
  $scope.done = function() {
    console.log("Reached done()");
    http.post('setUser', {realname: $scope.name}, function(response) {
      console.log(response);
      user.setName($scope.name);
      $location.path('list');
    });
  };

}
]);

chattControllers.controller('navigationController', ['$scope',  '$location',
function($scope,  $location) {
  $scope.location = $location.path();

  // // This function should direct the user to the wanted page
  $scope.redirect = function(address) {
    $location.hash("");
    $location.path('/' + address);
    $scope.location = $location.path();
    console.log("location = " + $scope.location);
  };

}
]);
