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

      //public functions
      vm.openModal = openModal;
      vm.viewDetails = viewDetails;
      vm.deleteNotification = deleteNotification;
      vm.confirmSignature = confirmSignature;

      //private functions
      function activate() {
        firebase.database().ref('Argus/Notifiacion')
          .on('value', function (snapshot) {
            vm.notifications = snapshot.val();
          })

        if(sessionStorage.getItem('notificationConfirm') === null){
        }else{
          vm.notification = JSON.parse(sessionStorage['notificationConfirm']);
          sessionStorage.clear();
          openModal();
        }

        $scope.$on('notificaciones:confirmar', function (event, notification) {
          vm.notification = notification;
          openModal();
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

      function deleteNotification(key) {
        alertService.error('Eliminar notificacion', '¿Estas seguro que quieres eliminar esta notificacion?').then(function () {

        });
        firebase.database().ref('Argus/Notifiacion/' + key).remove();
      }

      function confirmSignature(fecha, guardKey) {
        var updates = {};
        updates['Argus/Bitacora/' + fecha + '/' + guardKey + '/asisitio'] = true;

        firebase.database().ref().update(updates);
        vm.modal.dismiss()

      }

    }
  ]);
