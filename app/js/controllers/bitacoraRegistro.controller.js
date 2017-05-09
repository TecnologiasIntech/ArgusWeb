/**
 * Created by Toshiba on 03/03/2017.
 */

argus
  .controller('bitacoraRegistroCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl','$location', '$timeout',
    function ($scope, $rootScope, alertService, $uibModal, growl, $location, $timeout) {

      //public var
      var vm = this;

      // vm.recordsCurrentDate = {};
      // vm.month;
      // vm.fecha = new Date();
      vm.months = new Array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
      vm.firstDate = new Date();
      vm.secondDate = vm.firstDate;
      // vm.firstDate;
      // vm.secondDate;
      vm.datesRecords;
      vm.fullRecords = [];
      vm.supervisorData = {};
      vm.supervisores = {};


      // Public functions
      vm.getRecords = getRecords;
      vm.getSupervisor = getSupervisor;
      vm.getFullDate = getFullDate;
      vm.deleteNotification = deleteNotification;
      vm.confirmSignature = confirmSignature;


      //private functions
      function activate() {

        firebase.database().ref('Argus/supervisores/')
        .on('value', function (snapshot) {
          vm.supervisores = snapshot.val();
        });

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

      function getRecords(){

        if (vm.firstDate) {
          var date1 = dateFormat(vm.firstDate);
          var date2 = dateFormat(vm.secondDate);
          var zona;
          firebase.database().ref('Argus/BitacoraRegistro')
            .orderByChild('fecha')
            .startAt(date1)
            .endAt(date2)
            .once('value', function (snapshot) {
              vm.datesRecords ={};
              vm.datesRecords = snapshot.val();
              console.log(vm.datesRecords);
              $timeout(100 )
            });
        } else {
          // growl.warning('No has seleccionado la primera fecha', vm.config);
        }
      }

      function getFullDate(fecha){
        vm.day = fecha.substr(6,7);
          vm.year = fecha.substr(0,4);
          var fechaCorta = fecha.substring(4);
          vm.month = fechaCorta.substr(0,2);
          if (vm.month < 10) {
            vm.month = vm.month.substring(1);
          }
          vm.fullDate = vm.day + " de " + vm.months[ vm.month - 1 ] + " del " + vm.year;

      }

      vm.nombre="";
      function dateFormat(date) {
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var day = ("0" + (date.getUTCDate())).slice(-2);
        var year = date.getUTCFullYear();
        return (year + '' + month + '' + day);
      }

      function getSupervisor( keySupervisor ) {
        for( var supervisor in vm.supervisores){
          if(supervisor == keySupervisor){
            vm.nombre = vm.supervisores[supervisor].usuarioNombre;
          }
        }

      }

      function deleteNotification(Notificationkey, confirmationAssist) {
        if(confirmationAssist){
          firebase.database().ref('Argus/NotificacionTmp/' + Notificationkey).remove();
        }else{
          alertService.confirm('Eliminar notificacion', '¿Estas seguro que quieres eliminar esta notificacion?').then(function () {
            firebase.database().ref('Argus/NotificacionTmp/' + Notificationkey).remove();
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
