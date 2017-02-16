/**
 * Created by Toshiba on 14/02/2017.
 */
argus
  .controller('supervisorCtrl', ['$firebaseArray', '$location', '$scope', '$rootScope', 'alertService',
    function ($firebaseArray, $location, $scope, $rootScope, alertService, $sessionStorage, $localStorage) {

      //public var
      var vm = this;
      vm.isMoreActions = false;

      //public functions


      //private functions
      function activate() {
        // firebase.auth().onAuthStateChanged(function (user) {
        //   if (user) {
        //     $location.path('/main');
        //     $rootScope.$apply();
        //   }
        // });
      }

      activate();

    }
  ]);
