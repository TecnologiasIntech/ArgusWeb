/**
 * Created by Toshiba on 04/03/2017.
 */
argus
  .controller('notificacionCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal',
    function ($scope, $rootScope, alertService, $uibModal) {

      //public var
      var vm = this;
      vm.notifications = [];
      vm.notification = [];
      vm.notificationKey = '';

      //public functions
      vm.openModal = openModal;
      vm.viewDetails = viewDetails;
      vm.deleteNotification = deleteNotification;
      vm.confirmSignature = confirmSignature;

      //private functions
      function activate() {
        firebase.database().ref('Argus/Notificacion')
          .on('value', function (snapshot) {
            vm.notifications = snapshot.val();
          })

        if(sessionStorage.getItem('notificationConfirm') === null){
        }else{
          vm.notification = JSON.parse(sessionStorage['notificationConfirm']);
          sessionStorage.clear();
          openModal();
        }

        if(sessionStorage.getItem('notificacionKey') !== null){
          vm.notificationKey = sessionStorage.getItem('notificacionKey');
        }

        $scope.$on('notificaciones:confirmar', function (event, notification) {
          vm.notification = notification;
          openModal();
        });

        // Notification Key
        $scope.$on('notificacion:key', function (event, notificationKey) {
          vm.notificationKey = notificationKey;
        })
      }
      activate();

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/notificaciones.modal.html',
          scope: $scope,
          size: 'lm',
          backdrop: 'static'
        });
      }

      function viewDetails(notification) {
        vm.notification = notification;
        openModal();
      }

      function deleteNotification(Notificationkey, confirmationAssist) {
        if(confirmationAssist){
          firebase.database().ref('Argus/NotifiacionTmp/' + Notificationkey).remove();
        }else{
          alertService.error('Eliminar notificacion', '¿Estas seguro que quieres eliminar esta notificacion?').then(function () {
            firebase.database().ref('Argus/NotifiacionTmp/' + Notificationkey).remove();
          });

        }

      }

      function confirmSignature(fecha, guardKey, client) {
        var updates = {};
        updates['Argus/Bitacora/' + fecha + '/' + guardKey + '/asistio'] = true;
        updates['Argus/Clientes/' + client + '/clienteGuardias/' + guardKey + '/usuarioAsistenciaDelDia'] = 'asistio';

        firebase.database().ref().update(updates);

        deleteNotification(vm.notificationKey, true);

        vm.modal.dismiss()

      }

    }
  ]);
