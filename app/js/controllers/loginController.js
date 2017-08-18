/**
 * Created by Toshiba on 18/12/2016.
 */

argus
  .controller('loginCtrl', ['$location', '$scope', '$rootScope', 'alertService', 'settings',
    function ($location, $scope, $rootScope, alertService, settings) {

      //public var
      var vm = this;
      vm.email = '';
      vm.password = '';
      vm.checkUser = false;
      vm.resetEmail = '';
      vm.isAdmin = false;
      vm.isLoading = false;

      //public functions
      vm.activate = activate;
      vm.login = login;
      vm.resetPassword = resetPassword;

      //private functions
      function activate() {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            $location.path('/supervisores');
            $rootScope.$apply();
          }
        });
      }

      activate();

      function login() {
        vm.isLoading = true;
        firebase.database().ref('Argus/administradores')
          .orderByChild('usuarioEmail')
          .equalTo(vm.email)
          .on('value', function (snapshot) {
            vm.isAdmin = snapshot.val();

            if(vm.isAdmin != null){
              firebase.auth().signInWithEmailAndPassword(vm.email, vm.password).then(function () {
                //Comprobamos si está autenticado
                firebase.auth().onAuthStateChanged(function (user) {
                  if (user) {
                    localStorage.setItem('email', vm.email);
                    localStorage.setItem('password', vm.password);
                    location.href = '#/supervisores';
                  }
                });
                //En caso de error lo cachamos aqui y mostramos el error en pantalla
              }).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error);
                switch (errorCode) {
                  case 'auth/wrong-password':
                    alertService.error('¡Contraseña incorrecta!', 'Verifica que tu contraseña este correctamente escrita');
                    break;
                  case 'auth/user-not-found':
                    alertService.error('¡Usuario no encontrado!', 'Verifica que el usuario que escribiste sea correcto');
                    break;
                  case 'auth/invalid-email':
                    alertService.error('¡Correo electrónico no válido!', 'Escribe un correo electrónico válido');
                    break;
                  case 'auth/user-disabled':
                    alertService.error('¡Usuario baneado!', 'Ponte en contacto con los administradores de la página para una solución');
                    break;
                }
                vm.isLoading = false;
                $rootScope.$apply();
              });

            }else{
              alertService.error('¡Usuario no autorizado!', 'Verifica tu dirección de correo electrónico o ponte en contacto con un administrador');
              vm.isLoading = false;
              $rootScope.$apply();
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
