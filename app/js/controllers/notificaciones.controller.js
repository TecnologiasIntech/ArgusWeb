/**
 * Created by Toshiba on 04/03/2017.
 */
argus
  .controller('notificacionCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal',
    function ($scope, $rootScope, alertService, $uibModal) {

      //public var
      var vm = this;
      vm.notifications = [];

      //public functions

      //private functions
      function activate() {
        firebase.database().ref('Argus/Notificacion')
          .on('value', function (snapshot) {
            vm.notifications = snapshot.val();
          })
      }
      activate();

    }
  ]);
