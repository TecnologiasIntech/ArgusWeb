/**
 * Created by Toshiba on 03/03/2017.
 */
argus
  .controller('headerCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', '$location', '$interval', '$notification', '$timeout', 'userService',
    function ($scope, $rootScope, alertService, $uibModal, $location, $interval, $notification, $timeout, userService) {

      //public var
      var vm = this;
      vm.notifications = [];
      vm.notificationsLength = 0;
      vm.isReadyToListener = false;

      //public functions
      vm.verifyAction = verifyAction;
      vm.goToNotifications = goToNotifications;
      vm.deleteNotifications = deleteNotifications;
      vm.deleteNotification = deleteNotification;

      //private functions
      function activate() {
        firebase.database().ref('Argus/NotificacionTmp')
          // .limitToLast(8)
          .on('value', function (snapshot) {
            //Voy a recibir
            //  * Tipo de accion que se ha hecho
            vm.notifications = snapshot.val();

            if(vm.notifications === null){
              vm.notificationsLength = 0;
            }else {
              if (vm.notificationsLength < Object.keys(vm.notifications).length && vm.isReadyToNotification) {
                vm.i = '';
                for (var ja in vm.notifications) {
                  vm.i = vm.notifications[ja].descripcion;
                }
                $notification('Notificación de Argus', {
                  body: vm.i,
                  dir: 'auto',
                  lang: 'en',
                  tag: 'my-tag',
                  icon: '../img/argus-icon-v2.jpeg',
                  delay: 10000,
                  focusWindowOnClick: true
                });
              }
              vm.notificationsLength = Object.keys(vm.notifications).length;
            }
            // $rootScope.$apply();
            $timeout(10);
            vm.isReadyToNotification = true;
          })

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

      function verifyAction(action, information, bitacoraInformation, key, notificacion) {
        if(vm.userType != 'director') {
          switch (action) {
            case 'AG':
              if ($location.path() !== '/supervisores') {
                sessionStorage['guardiaInformacion'] = JSON.stringify(information);
                sessionStorage['bitacoraInformacion'] = JSON.stringify(bitacoraInformation);
                sessionStorage['notificacionKey'] = key;
                $location.path('/supervisores');
              } else {
                $rootScope.$broadcast('notificacion:agregar', information);
                $rootScope.$broadcast('notificacion:bitacora', bitacoraInformation);
                $rootScope.$broadcast('notificacion:key', key);
              }
              break;

            case 'MG':
              break;

            case 'AI':
              if ($location.path() === '/bitacoraRegistro') {
                $rootScope.$broadcast('notificaciones:confirmar', notificacion);
                $rootScope.$broadcast('notificacion:key', key);
              } else {

                sessionStorage['notificationConfirm'] = JSON.stringify(notificacion);
                sessionStorage['notificacionKey'] = key;
                $location.path('/bitacoraRegistro');

              }
              break;

            case 'CF':
              if ($location.path() === '/bitacoraRegistro') {
                $rootScope.$broadcast('notificaciones:confirmar', notificacion);
                $rootScope.$broadcast('notificacion:bitacora', bitacoraInformation);
                $rootScope.$broadcast('notificacion:key', key);
              } else {

                sessionStorage['notificationConfirm'] = JSON.stringify(notificacion);
                sessionStorage['bitacoraInformacion'] = JSON.stringify(bitacoraInformation);
                sessionStorage['notificacionKey'] = key;
                $location.path('/bitacoraRegistro');

              }
              break;
          }
        }
      }

      function goToNotifications() {
        $location.path('/notificaciones');
      }

      function deleteNotifications() {
        alertService.confirm('Borrar Notificaciones', '¿Está seguro que desea eliminar todas las notificaciones?').then(function () {
          firebase.database().ref('Argus/NotificacionTmp').remove();
        });
        $timeout(10);
      }

      function deleteNotification(Notificationkey) {
        if(vm.userType != 'director') {
          alertService.confirm('Eliminar notificacion', '¿Estas seguro que quieres eliminar esta notificacion?').then(function () {
            firebase.database().ref('Argus/NotificacionTmp/' + Notificationkey).remove();
          });
        }
      }

    }
  ]);
