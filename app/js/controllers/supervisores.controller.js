/**
 * Created by Toshiba on 14/02/2017.
 */
argus
  .controller('supervisorCtrl', ['$location', '$scope', '$rootScope', 'alertService', '$uibModal', 'growl', '$firebaseArray',
    function ($location, $scope, $rootScope, alertService, $uibModal, growl, $firebaseArray) {

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
      vm.zonesAvailable=[];
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
      vm.zonaSupervisorEliminado="";

      //public functions
      vm.openModal = openModal;
      vm.changeView = changeView;
      vm.editUser = editUser;
      vm.deleteUser = deleteUser;
      vm.registerUser = registerUser;
      vm.updateUser = updateUser;
      vm.editUserCancel = editUserCancel;
      vm.verifyUser = verifyUser;

      //private functions
      function activate() {

        firebase.database().ref('Argus/Zonas/')
        .on('value', function(snapshot){
          vm.zonas = snapshot.val();
        });

        var user = firebase.auth().currentUser;

        if (user) {
          // User is signed in.
        } else {
          $location.path('/login');
          // $rootScope.$apply();
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
            vm.supervisoresArray = [];

            _.forEach(vm.supervisores, function (value, key) {
              value.key = key;
              vm.supervisoresArray.push(value);
              // console.log(value);
            });
            $rootScope.$apply();
          });

        firebase.database().ref('Argus/administradores/')
          .on('value', function (snapshot) {
            vm.administradores = snapshot.val();
            vm.isLoading = false;
            $rootScope.$apply();
          });



        vm.emailAdmin = localStorage.getItem('email');
        vm.passwordAdmin = localStorage.getItem('password');

        if (sessionStorage.getItem("guardiaInformacion") === null && sessionStorage.getItem('notificacionKey') === null) {
        } else {
          vm.guardiaInformacion = JSON.parse(sessionStorage['guardiaInformacion']);
          vm.notificationkey = sessionStorage.getItem('notificacionKey');

          vm.user = vm.guardiaInformacion;
          vm.user.usuarioTipo = 'guardia';
          vm.isAssignmentToZone = true;
          sessionStorage.clear();
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

      function verifyUser(user) {
        if(user === 'supervisor'){
          firebase.database().ref('Argus/Zonas/')
            .once('value', function (snapshot) {
              var zonas = _.find(snapshot.val(), {'disponibilidadZona': true});
              vm.zonas = _.filter(snapshot.val(), {'disponibilidadZona': true});

              if (zonas) {
                openModal();
              } else {
                alertService.error('No hay zonas disponibles', 'Agregar una nueva zona para poder agregar un supervisor');
              }
          })
        }else{
          openModal();
        }

      }

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

      vm.saveUser=[];
      function editUser(user, userType) {
        vm.isEdit = true;
        vm.user = user;
        vm.saveUser.push(user);

        //Solo cuando se es supervisor
        if(userType === 'supervisor'){
          firebase.database().ref('Argus/Zonas/'+vm.user.usuarioZona).update({
            disponibilidadZona: true
          });
        }
        vm.openModal();
        // console.log(user);
      }
      function editUserCancel(userType){
        if(userType === 'supervisor'){
          firebase.database().ref('Argus/Zonas/'+vm.saveUser[0].usuarioZona).update({
            disponibilidadZona: false
          });
        }
        vm.saveUser=[];
        vm.user = {};
      }

      function updateUser() {
        vm.saveUser=[];
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
            firebase.database().ref('Argus/Zonas/'+vm.user.usuarioZona).update({
              disponibilidadZona: false
            });
            break;

          case 'administrador':

          firebase.database().ref('Argus/Zonas/'+vm.user.usuarioZona).child('zonaDisponiblidad').set()
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
      vm.clienteDelGuardia = "";
      function deleteUser(user, type, userKey) {
        vm.zonaSupervisorEliminado = "";

        alertService.confirm('Eliminar usuario', '¿Estas seguro de que desea eliminar este usuario?').then(function () {
          if(user.usuarioTipo != 'guardia'){

            /*Obtenemos la zona que tiene asignada el supervisor*/
            firebase.database().ref('Argus/supervisores/'+ userKey).child('usuarioZona')
            .on('value', function(snapshot){
              vm.zonaSupervisorEliminado = snapshot.val();
            });

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
                    location.reload();

                  }).catch(function (error) {
                    var errorCode = error.code;
                    console.log(errorCode);
                  });

                }, function(error) {
                  console.log(error);
                });

              }).catch(function (error) {
                var errorCode = error.code;
                //Inicio de sesion de emergencia
                firebase.auth().signInWithEmailAndPassword(vm.emailAdmin, vm.passwordAdmin).then(function () {
                });

              });
            }, function (error) {
            });
            /*Una vez eliminado el supervisor hacemos dispobible la zona que tenia asignada*/
            firebase.database().ref('Argus/Zonas/'+ vm.zonaSupervisorEliminado).update({
              disponibilidadZona: true
            });
          }
          else{
            firebase.database().ref('Argus/' + type + '/' + user.$key).remove();
            if(user.usuarioClienteAsignado){
              firebase.database().ref('Argus/Clientes/' + user.usuarioClienteAsignado + '/clienteGuardias/' + userKey).remove();
            }
          }
        });


      }

      function registerUser() {
        if (vm.user.usuarioTipo != 'guardia') {
          registerUserWithEmail();
        } else {
          saveUserInformation();
        }
      }

      function registerUserWithEmail() {
        vm.isLoadingRegister = true;
        firebase.auth().createUserWithEmailAndPassword(vm.user.usuarioEmail, vm.user.usuarioContrasena).catch(function(error) {
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
        }).then(function () {
          //Cerramos sesion
          firebase.auth().signOut().then(function () {
            // Iniciamos sesion
            firebase.auth().signInWithEmailAndPassword(vm.emailAdmin, vm.passwordAdmin).then(function () {
              // Salvamos los datos de la cuenta creada
              saveUserInformation();
              vm.isLoadingRegister = false;
              location.reload();

              // $rootScope.$apply();
            }).catch(function (error) {
              var errorCode = error.code;
              console.log(errorCode);
            });
          }, function (error) {
            alert(error);
          });
        })

      }

      function saveUserInformation() {
        var tipoPlural;
        if (vm.user.usuarioTipo != 'guardia') {
          tipoPlural = 'es';
        } else {
          tipoPlural = 's';
          if(vm.isAssignmentToZone){
            vm.user.usuarioDisponible = false;
          }else{
            vm.user.usuarioDisponible = true;
          }

        }

        firebase.database().ref('Argus/' + vm.user.usuarioTipo + tipoPlural).push(vm.user);

        firebase.database().ref('Argus/Zonas/'+vm.user.usuarioZona).child('disponibilidadZona').set(false);

        if(vm.isAssignmentToZone){

          firebase.database().ref('Argus/guardias')
            .orderByChild('usuarioNombre')
            .equalTo(vm.user.usuarioNombre)
            .on('value', function (snapshot) {
              var guardia = snapshot.val();
              vm.user.key = Object.keys(guardia);

              firebase.database().ref('Argus/Clientes/' + vm.user.usuarioClienteAsignado + '/clienteGuardias/' + vm.user.key).set({
                usuarioKey: vm.user.key[0],
                usuarioNombre: vm.user.usuarioNombre
              });
              firebase.database().ref('Argus/NotificacionTmp/' + vm.notificationkey).remove();

              vm.isAssignmentToZone = false;
              vm.notificationkey = '';
            })
        }
        vm.user = {};
        vm.user.usuarioTipo = 'guardia';
        // $rootScope.$apply();
        growl.success('Usuario Agregado exitosamente!', vm.config);
        vm.modal.dismiss();

      }
    }
  ]);
