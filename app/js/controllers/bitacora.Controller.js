/**
 * Created by Toshiba on 03/03/2017.
 */

argus
  .controller('bitacoraCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl',
    function ($scope, $rootScope, alertService, $uibModal, growl) {

      //public var
      var vm = this;
      vm.myDate = new Date();
      vm.records = {};
      vm.isReady = false;
      vm.config = {};
      vm.picture = '';
      // vm.adios = '';


      //public functions
      vm.viewRecords = viewRecords;
      vm.openPicture = openPicture;
      vm.openModal = openModal;

      //private functions
      function activate() {

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
          var primaryDate = dateFormat(vm.myDate);
          var secondDate = dateFormat(vm.secondDate);

          firebase.database().ref('Argus/Bitacora')
            .orderByChild('fecha')
            .startAt(secondDate)
            .endAt(primaryDate)
            .on('value', function (snapshot) {
              // vm.records = {};
              vm.records = snapshot.val();
              vm.recordsLength = Object.keys(vm.records).length;
              if(vm.recordsLength != 0){
                vm.isReady = true;
              }else{
                vm.isReady = false;
              }
              console.log(vm.records)
              $rootScope.$apply();
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
    }
  ]);
