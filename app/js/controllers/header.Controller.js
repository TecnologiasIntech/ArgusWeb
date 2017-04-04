/**
 * Created by Toshiba on 03/03/2017.
 */
argus
  .controller('headerCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', '$location', '$interval', '$notification',
    function ($scope, $rootScope, alertService, $uibModal, $location, $interval, $notification) {

      //public var
      var vm = this;
      vm.notifications = [];
      vm.notificationsLength = 0;
      vm.isReadyToListener = false;

      //public functions
      vm.verifyAction = verifyAction;
      vm.goToNotifications = goToNotifications;
      vm.deleteNotifications = deleteNotifications;

      //private functions
      function activate() {
        firebase.database().ref('Argus/NotificacionTmp')
          .limitToLast(10)
          .on('value', function (snapshot) {
            //Voy a recibir
            //  * Tipo de accion que se ha hecho
            vm.notifications = snapshot.val();

            if(vm.notifications == null){
              vm.notificationsLength = 0;
            }else {
              if (vm.notificationsLength < Object.keys(vm.notifications).length && vm.isReadyToNotification) {
                vm.i = '';
                for (var ja in vm.notifications) {
                  vm.i = vm.notifications[ja].descripcion;
                  console.log(vm.i);
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
            $rootScope.$apply();
            vm.isReadyToNotification = true;
          })
      }

      activate();

      function verifyAction(action, information, key, notificacion) {
        switch (action){
          case 'AG':
            if($location.path() !== '/supervisores'){
              sessionStorage['guardiaInformacion'] = JSON.stringify(information);
              $location.path('/supervisores');
            }else{
              $rootScope.$broadcast('notificacion:agregar', information);
              $rootScope.$broadcast('notificacion:key', key);
            }
            break;

          case 'MG':
            break;

          case 'AI':
            break;

          case 'CF':
            if($location.path() === '/notificaciones'){
              $rootScope.$broadcast('notificaciones:confirmar', notificacion);
            }else{

                sessionStorage['notificationConfirm'] = JSON.stringify(notificacion);
                $location.path('/notificaciones')

            }
            break;
        }
      }

      function goToNotifications() {
        $location.path('/notificaciones');
      }

      function deleteNotifications() {
        alertService.confirm('Borrar Notificaciones', '¿Está seguro que desea eliminar todas las notificaciones?').then(function () {
          firebase.database().ref('Argus/NotificacionTmp').remove();
        })
        $rootScope.$apply();
      }
    }
  ]);
