/**
 * Created by Toshiba on 18/12/2016.
 */

argus
  .controller('loginCtrl', ['$firebaseArray', '$location', '$scope', '$rootScope', 'alertService', 'settings',
    function ($firebaseArray, $location, $scope, $rootScope, alertService, settings) {

      //public var
      var vm = this;
      vm.email = '';
      vm.password = '';
      vm.checkUser = false;
      vm.resetEmail = '';

      //public functions
      vm.activate = activate;
      vm.login = login;
      vm.resetPassword = resetPassword;

      //private functions
      function activate() {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            $location.path('/main');
            $rootScope.$apply();
          }
        });
      }

      activate();

      function login() {
        firebase.auth().signInWithEmailAndPassword(vm.email, vm.password).then(function () {
          //Comprobamos si está autenticado
          firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
              location.href = '#/main';
            }
          });
          //En caso de error lo cachamos aqui y mostramos el error en pantalla
        }).catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(error);
          switch (errorCode) {
            case 'auth/wrong-password':
              alertService.error('Contraseña incorrecta', 'Verifica que tu contraseña este corretamente escrita');
              break;
            case 'auth/user-not-found':
              alertService.error('Usuario no encontrado', 'Verifica que el usuario que escribiste sea correcto');
              break;
            case 'auth/invalid-email':
              alertService.error('Email no valido', 'Escribe un email valido');
              break;
            case 'auth/user-disabled':
              alertService.error('Usuario baneado', 'Ponte en contacto con los administradores de la pagina para una solución');
              break;
          }
        });
      }

      function resetPassword() {
        var auth = firebase.auth();

        auth.sendPasswordResetEmail(vm.resetEmail).then(function () {
          alertService.complete('Correcto', 'Consulta tu bandeja de correo eletronico').then(function () {
            location.href = '#/login';
          })
        }, function (error) {
          switch (error.code) {
            case 'auth/user-not-found':
              alertService.error('Usuario no encontrado', 'Verifica que el usuario que escribiste sea correcto');
              break;
            case 'auth/user-disabled':
              alertService.error('Usuario baneado', 'Ponte en contacto con los administradores de la pagina para una solución');
              break;
          }
        });
      }
    }
  ])
;
