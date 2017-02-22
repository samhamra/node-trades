(function(){
  var app = angular.module("chat", [
  'ngRoute',
  'chattControllers',
  'ui.bootstrap',
  'stockControllers'
  ]);

  app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/list', {
        templateUrl: 'list.html',
        controller: 'listController'
      }).
      when('/securities', {
        templateUrl: 'securities.html',
        controller: 'securityController'
      }).
      when('/orders', {
        templateUrl: 'orders.html',
        controller: 'orderController'
      }).
      when('/trades', {
        templateUrl: 'trades.html',
        controller: 'tradeController'
      }).
      when('/about', {
        templateUrl: 'about.html',
        controller: 'aboutController'
      }).
      when('/login', {
        templateUrl: 'login.html',
        controller: 'loginController'
      }).
      when('/room/:room', {
        templateUrl: 'room.html',
        controller: 'roomController'
      }).
      otherwise({
        redirectTo: '/list'
      });
  }]);
})();
