/**
 * Created by Toshiba on 14/02/2017.
 */
argus
  .controller('supervisorCtrl', ['$firebaseArray', '$location', '$scope', '$rootScope', 'alertService', '$uibModal',
    function ($firebaseArray, $location, $scope, $rootScope, alertService, $uibModal) {

      //public var
      var vm = this;
      vm.isMoreActions = false;

      //public functions
      vm.openModal = openModal;


      //private functions
      function activate() {
        // firebase.auth().onAuthStateChanged(function (user) {
        //   if (user) {
        //     $location.path('/main');
        //     $rootScope.$apply();
        //   }
        // });
      }

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/supervisores.modal.html',
          scope: $scope,
          size: 'lg',
          backdrop: 'static'
        })
      }

      activate();

    }
  ]);
