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
            //  *
            vm.notifications = snapshot.val();
            // console.log(vm.notifications);

            // // Reverse
            // vm.notifications = {};
            // vm.notifications = _.forEachRight(vm.notifications, function (value) {
            //   vm.notifications.push(value)
            // });
            // console.log(vm.notifications)

            // $interval(function(){
            if (vm.notificationsLength < Object.keys(vm.notifications).length && vm.isReadyToListener) {
              vm.i = '';
              for(var ja in vm.notifications){
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
            vm.isReadyToListener = true;
            vm.notificationsLength = Object.keys(vm.notifications).length;
            $rootScope.$apply();
            // }, 5000);
          })


      }

      activate();

      function verifyAction(action, information, key) {
        switch (action){
          case 'AG':
            if($location.path() != '/supervisores'){
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
        }
      }

      function goToNotifications() {
        $location.path('/notificaciones');
      }

      function deleteNotifications() {
        alertService.confirm('Borrar Notificaciones', '¿Está seguro que desea eliminar todas las notificaciones?').then(function () {
          firebase.database().ref('Argus/NotificacionTmp').remove();
        })
      }
    }
  ]);
