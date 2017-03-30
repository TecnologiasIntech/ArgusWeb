/**
 * Created by Toshiba on 14/02/2017.
 */
argus
  .controller('supervisorCtrl', ['$location', '$scope', '$rootScope', 'alertService', '$uibModal', 'growl',
    function ($location, $scope, $rootScope, alertService, $uibModal, growl) {

      //public var
      var vm = this;
      vm.isMoreActions = false;
      vm.view = 'general';
      vm.buscarGuardia = '';
      vm.buscarUsuario = '';
      vm.user = {};
      vm.administradores = {};
      vm.supervisores = {};
      vm.guardias = {};
      vm.zonas = {};
      vm.user.usuarioTipo = 'guardia';
      vm.userAsignacion = {};
      vm.emailAdmin = '';
      vm.passwordAdmin = '';
      vm.searchTypeUser = 'guardia';
      vm.config = {};
      vm.isLoading = false;
      vm.isLoadingRegister = false;
      vm.guardiaInformacion = {};
      vm.viewPassword = false;
      vm.isAssignmentToZone = false;
      vm.notificationkey = '';

      //public functions
      vm.openModal = openModal;
      vm.changeView = changeView;
      vm.editUser = editUser;
      vm.deleteUser = deleteUser;
      vm.registerUser = registerUser;
      vm.updateUser = updateUser;

      //private functions
      function activate() {

        var user = firebase.auth().currentUser;

        if (user) {
          // User is signed in.
        } else {
          $location.path('/login');
          $rootScope.$apply();
        }
        // firebase.auth().onAuthStateChanged(function (user) {
        //   if (!user) {
        //     $location.path('/login');
        //     $rootScope.$apply();
        //   }
        // });

        // Datos de todos los usuarios
        vm.isLoading = true;

        firebase.database().ref('Argus/guardias/')
          .on('value', function (snapshot) {
            vm.guardias = snapshot.val();
            $rootScope.$apply();
          });

        firebase.database().ref('Argus/supervisores/')
          .on('value', function (snapshot) {
            vm.supervisores = snapshot.val();
          });

        firebase.database().ref('Argus/administradores/')
          .on('value', function (snapshot) {
            vm.administradores = snapshot.val();
            vm.isLoading = false;
            $rootScope.$apply();
          });

        firebase.database().ref('Argus/Zonas/')
          .on('value', function (snapshot) {
            vm.zonas = snapshot.val();
          });

        vm.emailAdmin = localStorage.getItem('email');
        vm.passwordAdmin = localStorage.getItem('password');

        if (sessionStorage.getItem("guardiaInformacion") === null) {
        } else {
          vm.guardiaInformacion = JSON.parse(sessionStorage['guardiaInformacion']);

          vm.user = vm.guardiaInformacion;
          vm.user.usuarioTipo = 'guardia';
          sessionStorage.clear();
          vm.isAssignmentToZone = true;
          openModal();
        }

        $scope.$on('notificacion:agregar', function (event, information) {
          vm.user = information;
          vm.user.usuarioTipo = 'guardia';
          vm.isAssignmentToZone = true;
          openModal();
        })

        $scope.$on('notificacion:key', function (event, key) {
          vm.notificationkey = key;
        })

      }

      activate();

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/supervisores.modal.html',
          scope: $scope,
          size: 'lm',
          backdrop: 'static'
        });
      }

      function changeView(view) {
        vm.view = view;
      }

      function editUser(user) {
        vm.isEdit = true;
        vm.user = user;
        vm.openModal();
        console.log(user);
      }

      function updateUser() {
        switch (vm.user.usuarioTipo) {

          case 'guardia':
            // ACTUALIZAR GUARDIAS
            firebase.database().ref('Argus/guardias/' + vm.user.$key + '/').update({
              usuarioNombre: vm.user.usuarioNombre,
              usuarioTelefono: vm.user.usuarioTelefono,
              usuarioDomicilio: vm.user.usuarioDomicilio,
              usuarioTurno: vm.user.usuarioTurno
            });
            break;

          case 'supervisor':
            // ACTUALIZAR SUPERVISORES
            firebase.database().ref('Argus/supervisores/' + vm.user.$key + '/').update({
              usuarioNombre: vm.user.usuarioNombre,
              usuarioEmail: vm.user.usuarioEmail,
              usuarioTelefono: vm.user.usuarioTelefono,
              usuarioDomicilio: vm.user.usuarioDomicilio,
              usuarioZona: vm.user.usuarioZona,
              usuarioTurno: vm.user.usuarioTurno,
              usuarioContrasena: vm.user.usuarioContrasena
            });
            break;

          case 'administrador':
            // ACTUALIZAR SUPERVISORES
            firebase.database().ref('Argus/administradores/' + vm.user.$key + '/').update({
              usuarioNombre: vm.user.usuarioNombre,
              usuarioEmail: vm.user.usuarioEmail,
              usuarioTelefono: vm.user.usuarioTelefono,
              usuarioDomicilio: vm.user.usuarioDomicilio,
              usuarioZona: vm.user.usuarioZona,
              usuarioTurno: vm.user.usuarioTurno,
              usuarioContrasena: vm.user.usuarioContrasena
            });
            break;
        }
        vm.user = {};
        vm.user.usuarioTipo = 'guardia';
        vm.isEdit = false;
        growl.info('Usuario Actualizado!', vm.config);
        vm.modal.dismiss();

      }

      function deleteUser(user, type, userKey) {

        alertService.confirm('Eliminar usuario', '¿Estas seguro de que desea eliminar este usuario?').then(function () {
          if(user.usuarioTipo != 'guardia'){
            //Cerramos sesion
            firebase.auth().signOut().then(function () {
              // Iniciamos sesion
              firebase.auth().signInWithEmailAndPassword(user.usuarioEmail, user.usuarioContrasena).then(function () {
                //Eliminamos la cuenta de Autentification
                var user = firebase.auth().currentUser;
                user.delete().then(function() {
                  // Volvemos a iniciar sesion actual
                  firebase.auth().signInWithEmailAndPassword(vm.emailAdmin, vm.passwordAdmin).then(function () {
                    // Listo
                    firebase.database().ref('Argus/' + type + '/' + userKey).remove();
                    $rootScope.$apply();
                  }).catch(function (error) {
                    var errorCode = error.code;
                    console.log(errorCode);
                  });

                }, function(error) {
                  console.log(error);
                });

              }).catch(function (error) {
                var errorCode = error.code;
                console.log(errorCode);
              });
            }, function (error) {
            });
          }else{
            firebase.database().ref('Argus/' + type + '/' + user.$key).remove();
          }
        });
      }

      function registerUser() {

        if (vm.user.usuarioTipo != 'guardia') {
          registerUserWithEmail();
        } else {
          saveUserInformation();
        }

        // var cred = firebase.auth.EmailAuthProvider.credential(
        //   'carlos_alatorre_9sds5@hotmail.com',
        //   'intech2017'
        // );
        // console.log(cred)
      }

      function registerUserWithEmail() {
        vm.isLoadingRegister = true;
        firebase.auth().createUserWithEmailAndPassword(vm.user.usuarioEmail, vm.user.usuarioContrasena).then(function () {
          //Cerramos sesion
          firebase.auth().signOut().then(function () {
            // Iniciamos sesion
            firebase.auth().signInWithEmailAndPassword(vm.emailAdmin, vm.passwordAdmin).then(function () {
              // Salvamos los datos de la cuenta creada
              saveUserInformation();
              vm.isLoadingRegister = false;

              // $rootScope.$apply();
            }).catch(function (error) {
              var errorCode = error.code;
              console.log(errorCode);
            });
          }, function (error) {
          });
        }).catch(function (error) {

          switch (error.code) {
            case 'auth/email-already-in-use':
              alertService.error('Email ya en uso', 'Intenta con uno diferente');
              break;
            case 'auth/invalid-email':
              alertService.error('Email invalido', 'Escribe un email valido');
              break;
            case 'auth/operation-not-allowed':
              alertService.error('Operacion no permitida', 'Ponte en contacto con los administradores de la pagina');
              break;
            case 'auth/weak-password':
              alertService.error('Contraseña muy debil', 'Escribe una contraseña dificil de adivinar');
              break;
          }
          vm.isLoadingRegister = false;
          $rootScope.$apply();
        });
      }

      function saveUserInformation() {
        var tipoPlural;
        if (vm.user.usuarioTipo != 'guardia') {
          tipoPlural = 'es';
        } else {
          tipoPlural = 's';
          vm.user.usuarioDisponible = true;
        }

        firebase.database().ref('Argus/' + vm.user.usuarioTipo + tipoPlural).push(vm.user);

        if(vm.isAssignmentToZone){

          firebase.database().ref('Argus/guardias')
            .orderByChild('usuarioNombre')
            .equalTo(vm.user.usuarioNombre)
            .on('value', function (snapshot) {
              var guardia = snapshot.val();
              vm.user.key = Object.keys(guardia);

              firebase.database().ref('Argus/Clientes/' + vm.user.usuarioCliente + '/clienteGuardias/' + vm.user.key).set({
                usuarioKey: vm.user.key[0],
                usuarioNombre: vm.user.usuarioNombre
              });
              firebase.database().ref('Argus/Notificacion/' + vm.notificationkey).remove();

              vm.isAssignmentToZone = false;
              vm.notificationkey = '';
            })
        }
        vm.modal.dismiss();
        vm.user = {};
        vm.user.usuarioTipo = 'guardia';
        // $rootScope.$apply();
        growl.success('Usuario Agregado exitosamente!', vm.config);


      }
    }
  ]);
