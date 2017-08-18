/**
 * Created by Toshiba on 20/01/2017.
 */
argus
  .controller('sidebarCtrl', ['$scope', '$rootScope', 'settings', 'userService'
    , function ($scope, $rootScope, settings, userService) {

      //public var
      var vm = this;
      vm.usuarioNombre = '';
      vm.usuarioFotoPerfil = '';
      vm.userType = '';

      //public functions
      vm.cerrarSesion = cerrarSesion;

      //private functions
      function activate() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {

            if(user.providerData[0].providerId == 'password'){
              vm.usuarioNombre = user.email;

              userService.getUserType(user.email).then(function (response) {
                vm.userType = response;
              })
            }else{
              vm.usuarioNombre = user.displayName;
              vm.usuarioFotoPerfil = user.photoURL;
            }
          }
        });
      }

      activate();

      function cerrarSesion() {
        firebase.auth().signOut().then(function() {
          location.href = '#/login';
        }, function(error) {
        });
      }

    }]);
