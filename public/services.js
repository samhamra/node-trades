(function() {

  angular.module('chat')
  .factory('UserService', function($http) {
    var username = "";

    // function getUsername() {
    //   $http.get('/API/getUsername').success(function(response) {
    //     username = response.username;
    //   });
    // }
    //
    // getUsername();
    return {
      // getUsername: getUsername,

      getName: function() {
        return username;
      },

      setName: function(name) {
        username = name;
      },

      clearData: function() {
        var username = "";
      }

    };
  })

  .factory('HttpService', function($http) {
    return {
      post: function(path, data, callback){
        $http.post('/API/' + path, data, {withCredentials: true}).then(callback);
      },
      get: function(path, callback){
        $http.get('/API/' + path).then(callback);
      }
    };
  });


})();
