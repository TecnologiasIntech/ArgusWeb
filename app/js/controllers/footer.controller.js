argus
  .controller('footerCtrl', ['$location', '$scope', '$rootScope', 'alertService', 'settings',
    function ($location, $scope, $rootScope, alertService, settings) {

      //public var
      var vm = this;
      vm.path = $location.path();

      //public functions


      //private functions
      function activate() {

      }
      activate();

      $scope.$on("$locationChangeSuccess", function (event) {
        vm.path = $location.path();
      });
    }
  ])
;
