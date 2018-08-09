/**
 * Created by Toshiba on 03/03/2017.
 */

argus
  .controller('bitacoraCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl','$location', '$timeout', 'userService',
    function ($scope, $rootScope, alertService, $uibModal, growl, $location, $timeout, userService) {

      //public var
      var vm = this;
      vm.myDate = new Date();
      vm.secondDate = vm.myDate;
      vm.records = {};
      vm.isReady = false;
      vm.config = {};
      vm.picture = '';
      vm.binnacleToExport = [];

      //public functions
      vm.viewRecords = viewRecords;
      vm.openPicture = openPicture;
      vm.openModal = openModal;
      vm.cancelAsssist = cancelAsssist;
      vm.downloadCSV = downloadCSV;

      //private functions
      function activate() {

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

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/bitacora.modal.html',
          scope: $scope,
          size: 'lm',
          backdrop: 'static'
        });
      }

      function viewRecords() {
        if (vm.secondDate) {
          vm.primaryDate = dateFormat(vm.myDate);
          vm.secondDates = dateFormat(vm.secondDate);

          firebase.database().ref('Argus/Bitacora')
            .orderByChild('fecha')
            .startAt(parseInt(vm.secondDates))
            .endAt(parseInt(vm.primaryDate))
            .once('value', function (snapshot) {
              vm.records = {};
              vm.records = snapshot.val();
              vm.recordsLength = Object.keys(vm.records).length;

              $rootScope.$applyAsync();
            })
        } else {
          growl.warning('No has seleccionado la primera fecha', vm.config);
        }
      }

      function dateFormat(date) {
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var day = ("0" + (date.getUTCDate())).slice(-2);
        var year = date.getUTCFullYear();
        return (year + '' + month + '' + day);
      }

      function openPicture(picture) {
        vm.picture = picture;
        openModal();

      }

      function cancelAsssist(date, assist, client) {
        alertService.confirm('Cancelar Asistencia del guardia', '¿Estas seguro que la desea cancelar?').then(function () {
          firebase.database().ref('Argus/Bitacora/' + date + '/' + assist).remove();

          var updates = {};
          updates['Argus/Clientes/' + client + '/clienteGuardias/' + assist + '/usuarioAsistenciaDelDia'] = 'No Asistió';
          // updates['Argus/Bitacora/' + date + '/' + assist + '/asistio'] = false;
          firebase.database().ref().update(updates);
        });

      }

      function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
          return null;
        }

        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
          ctr = 0;
          keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
          });
          result += lineDelimiter;
        });

        return result;
      }

      function downloadCSV(args) {
        var data, filename, link;

        vm.binnacleToExport = [];

        for(date in vm.records){
          for(guard in vm.records[date]){
            if(vm.records[date][guard].guardiaNombre){
              vm.binnacleToExport.push({
                Zona: vm.records[date][guard].zona,
                Cliente: vm.records[date][guard].cliente,
                Guardia: vm.records[date][guard].guardiaNombre,
                Turno: vm.records[date][guard].turno,
                Estatus: vm.records[date][guard].status,
                Observacion: vm.records[date][guard].observacion,
                Fecha: vm.records[date][guard].fecha
              })
            }
          }
        }

        var csv = convertArrayOfObjectsToCSV({
          data: vm.binnacleToExport
        });
        if (csv == null) return;

        filename = args.filename || 'export.csv';

        if (!csv.match(/^data:text\/csv/i)) {
          csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
      }
    }
  ]);
