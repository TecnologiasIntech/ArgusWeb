/**
 * Created by Toshiba on 14/02/2017.
 */
argus
  .controller('supervisorCtrl', ['$location', '$scope', '$rootScope', 'alertService', '$uibModal', 'growl', '$timeout',
    function ($location, $scope, $rootScope, alertService, $uibModal, growl, $timeout) {

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
      vm.saveUser=[];
      vm.clienteDelGuardia = "";
      vm.existingError = false;
      vm.validar = validar;
      vm.zonasDisponibles = [];
      vm.update = false;

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
        //
        var user = firebase.auth().currentUser;
        $timeout( function(){
          if (user) {
            // User is signed in.
          } else {
            $location.path('/login');
            // $rootScope.$apply();
          }
        }, 200 );

        vm.isLoading = true;

        firebase.database().ref('Argus/guardias/')
          .on('value', function (snapshot) {
            vm.guardias = snapshot.val();
            $rootScope.$apply();
          });

        firebase.database().ref('Argus/supervisores/')
          .on('value', function (snapshot) {
            vm.supervisores = snapshot.val();
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
          availableZones();
          if (vm.zonasDisponibles.length > 0) {
            openModal();
          } else {
            alertService.error('No hay zonas disponibles', 'Agregar una nueva zona para poder agregar un supervisor');
          }
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

      function editUser(user, userKey, userType) {
        vm.isEdit = true;
        vm.user = user;
        var domicilio = user.usuarioDomicilio.split(",");
        vm.user.usuarioKey = userKey;
        vm.user.usuarioColony = domicilio[0];
        vm.user.usuarioStreet = domicilio[1];
        vm.saveUser.push(user);

        //Solo cuando se es supervisor
        if(userType === 'supervisor'){
          if (vm.user.usuarioZona != undefined) {
            if (user.usuarioTurno == 'Día' /*vm.user.usuarioTurno == 'Día'*/) {
              firebase.database().ref('Argus/Zonas/'+ vm.user.usuarioZona +'/disponibilidadZona').update({
                disponibilidadDia: true
              });
            }
            else {
              firebase.database().ref('Argus/Zonas/'+ vm.user.usuarioZona +'/disponibilidadZona').update({
                disponibilidadNoche: true
              });
            }
          }
        }
        availableZones();
        openModal();
        // console.log(user);
      }

      function editUserCancel(userType, isEdit){
        if (isEdit) {
          if(userType === 'supervisor'){
            firebase.database().ref('Argus/supervisores/'+ vm.user.usuarioKey)
             .on('value', function(snapshot){
               vm.zoneSupervisor = snapshot.val();
               var domicilio = vm.zoneSupervisor.usuarioDomicilio.split(",");
               vm.user.usuarioNombre = vm.zoneSupervisor.usuarioNombre;
               vm.user.usuarioTelefono = vm.zoneSupervisor.usuarioTelefono;
               vm.user.usuarioZona = vm.zoneSupervisor.usuarioZona;
               vm.user.usuarioColony = domicilio[0];
               vm.user.usuarioStreet =  domicilio[1];
               vm.user.usuarioTurno = vm.zoneSupervisor.usuarioTurno;

               if (vm.zoneSupervisor.usuarioZona != undefined) { /*El undefined puede aparecer en caso de que se elimine la zona del supervisor*/
                 if (vm.zoneSupervisor.usuarioTurno == 'Día' /*vm.user.usuarioTurno == 'Día'*/) {
                   firebase.database().ref('Argus/Zonas/'+ vm.zoneSupervisor.usuarioZona +'/disponibilidadZona').update({
                     disponibilidadDia: false
                   });
                 }
                 else {
                   firebase.database().ref('Argus/Zonas/'+ vm.zoneSupervisor.usuarioZona +'/disponibilidadZona').update({
                     disponibilidadNoche: false
                   });
                 }
               }
               vm.saveUser=[];
               vm.user = {};
             });
          }
        }
        vm.saveUser=[];
        vm.user = {};
      }

      function updateUser() {
        switch (vm.user.usuarioTipo) {

          case 'guardia':
            vm.user.usuarioDomicilio = vm.user.usuarioColony + ',' + vm.user.usuarioStreet;
            // ACTUALIZAR GUARDIAS
            // TODO: quitar telefono por telefono de casa y de celular
            firebase.database().ref('Argus/guardias/' + vm.user.usuarioKey + '/').update({
              usuarioNombre: vm.user.usuarioNombre,
              usuarioTelefono: vm.user.usuarioTelefono,
              usuarioTelefonoCelular: vm.user.usuarioTelefonoCelular,
              usuarioDomicilio: vm.user.usuarioDomicilio,
              usuarioSueldoBase: vm.user.usuarioSueldoBase,
              usuarioTurno: vm.user.usuarioTurno,
            });
            vm.update = true;
            break;

          case 'supervisor':
          // ACTUALIZAR SUPERVISORES
            firebase.database().ref('Argus/Zonas/' + vm.user.usuarioZona +'/disponibilidadZona')
              .once('value', function(snapshot){
                vm.zonaUsuario = snapshot.val();
                switch (vm.user.usuarioTurno) {
                  case 'Día':
                    // update = false;
                    if (vm.zonaUsuario.disponibilidadDia) {
                      vm.update = true;
                    }
                    else {
                      if (!vm.update) {
                        alert("Ya existe un supervisor con este turno funcion update");
                      }
                    }
                    break;
                  case 'Noche':
                    // update = false;
                    if (vm.zonaUsuario.disponibilidadNoche) {
                      vm.update = true;
                    }
                    else {
                      if (!vm.update) {
                        alert("Ya existe un supervisor con este turno funcion update");
                      }
                    }
                    break;
                  default:
                }
              });
              if (vm.update) {
                vm.user.usuarioDomicilio = vm.user.usuarioColony + ',' + vm.user.usuarioStreet;
                var updates = {};
                // TODO: cambiar telefono por telefono de casa y de celular
                updates['Argus/supervisores/' + vm.user.usuarioKey + '/usuarioDomicilio'] = vm.user.usuarioDomicilio;
                updates['Argus/supervisores/' + vm.user.usuarioKey + '/usuarioNombre'] = vm.user.usuarioNombre;
                updates['Argus/supervisores/' + vm.user.usuarioKey + '/usuarioTelefono'] = vm.user.usuarioTelefono;
                updates['Argus/supervisores/' + vm.user.usuarioKey + '/usuarioTelefonoCelular'] = vm.user.usuarioTelefonoCelular;
                updates['Argus/supervisores/' + vm.user.usuarioKey + '/usuarioTurno'] = vm.user.usuarioTurno;
                updates['Argus/supervisores/' + vm.user.usuarioKey + '/usuarioZona'] = vm.user.usuarioZona;
                if (vm.user.usuarioTurno == 'Día') {
                  updates['Argus/Zonas/'+vm.user.usuarioZona + '/disponibilidadZona/disponibilidadDia'] = false;
                }
                else {
                  updates['Argus/Zonas/'+vm.user.usuarioZona + '/disponibilidadZona/disponibilidadNoche'] = false;
                }
                firebase.database().ref().update(updates);
              }
            break;

          case 'administrador':

            // ACTUALIZAR ADMINISTRADORES
            firebase.database().ref('Argus/administradores/' + vm.user.usuarioKey + '/').update({
              usuarioNombre: vm.user.usuarioNombre
            //  TODO: Agregar telefono de casa y telefono de celular
            });
            vm.update = true;
            break;
        }

        if (vm.update) {
          vm.user = {};
          vm.user.usuarioTipo = 'guardia';
          vm.isEdit = false;
          growl.info('¡Usuario actualizado!', vm.config);
          vm.modal.dismiss();
          // update = false;
        }

      }

      function deleteUser(user, type, userKey) {
        vm.zonaSupervisorEliminado = "";

        alertService.confirm('Eliminar usuario', '¿Estás seguro de que desea eliminar este usuario?').then(function () {
          if(user.usuarioTipo != 'guardia'){

            /*Obtenemos la zona que tiene asignada el supervisor*/
            firebase.database().ref('Argus/supervisores/'+ userKey).child('usuarioZona')
            .on('value', function(snapshot){
              vm.zonaSupervisorEliminado = snapshot.val();
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
          if(vm.user.usuarioTipo == 'supervisor' && !vm.user.usuarioZona){
            growl.error('Tiene que seleccionar una zona!', vm.config);
          }else{
            registerUserWithEmail();
          }

        } else {
          saveUserInformation();
        }
      }

      function registerUserWithEmail() {
        vm.existingError = false;
        vm.isLoadingRegister = true;
        firebase.auth().createUserWithEmailAndPassword(vm.user.usuarioEmail, vm.user.usuarioContrasena).catch(function(error) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              alertService.error('Email ya en uso', 'Intenta con uno diferente');
              vm.existingError = true;
              break;
            case 'auth/invalid-email':
              alertService.error('Email invalido', 'Escribe un email valido');
              vm.existingError = true;
              return true;
              break;
            case 'auth/operation-not-allowed':
              alertService.error('Operacion no permitida', 'Ponte en contacto con los administradores de la pagina');
              vm.existingError = true;
              break;
            case 'auth/weak-password':
              alertService.error('Contraseña muy debil', 'Escribe una contraseña dificil de adivinar');
              vm.existingError = true;
              break;
          }
          vm.isLoadingRegister = false;
          $rootScope.$apply();
        }).then(function(){
          if (vm.existingError == false) {
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
          }
          else {
            vm.isLoadingRegister = false;
          }
        });
        vm.isLoadingRegister = false;
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

        if(vm.user.usuarioTipo == 'supervisor'){
          firebase.database().ref('Argus/Zonas/'+vm.user.usuarioZona).child('disponibilidadZona').set(false);
        }

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

      function validar(e) { // 1
        tecla = (document.all) ? e.keyCode : e.which; // 2
        if (tecla==8) return true; // 3
        patron =/[A-Za-z\s]/; // 4
        te = String.fromCharCode(tecla); // 5
        return patron.test(te); // 6
      }

      function availableZones(){
        vm.zonasDisponibles = [];
        for (var zona in vm.zonas) {
          var nameZone = zona; /*En esta linea guardo el nombre de la zona para ponerlo en la lista de disponibles*/
          zona = vm.zonas[zona];
          for (var detallesZona in zona) {
            if (detallesZona == "disponibilidadZona") {
              detallesZona = zona[detallesZona];
              var x = detallesZona.disponibilidadDia;
              var y = detallesZona.disponibilidadNoche;
              if (detallesZona.disponibilidadDia || detallesZona.disponibilidadNoche) {
                vm.zonasDisponibles.push(nameZone);
              }
              break;
            }
          }
        }
      }

    }
  ]);
