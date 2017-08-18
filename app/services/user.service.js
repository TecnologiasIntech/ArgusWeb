argus
  .factory('userService', ['$q', function ($q) {

    return{
      getUserType: function (email) {
        var deferred = $q.defer();

        firebase.database().ref('Argus/administradores/')
          .orderByChild('usuarioEmail')
          .equalTo(email)
          .once('value', function (dataSnapshot) {
            var data = dataSnapshot.val();
            for(item in data){
              var response = data[item].usuarioTipo;
              deferred.resolve(response);
            }
          });

        return deferred.promise;
      }
    }
  }]);
