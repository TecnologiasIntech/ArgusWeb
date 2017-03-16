/**
 * Created by Toshiba on 20/01/2017.
 */
argus
  .controller('sidebarCtrl', ['$scope', '$rootScope', 'settings'
    , function ($scope, $rootScope, settings) {

      //public var
      var vm = this;
      vm.usuarioNombre = '';
      vm.usuarioFotoPerfil = '';

      //public functions
      vm.cerrarSesion = cerrarSesion;

      //private functions
      function activate() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {

            if(user.providerData[0].providerId == 'password'){
              vm.usuarioNombre = user.email;
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
          //TODO: crear las notificaciones para los errores esperados
        });
      }

    }]);
