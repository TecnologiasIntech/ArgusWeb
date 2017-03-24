/**
 * Created by Toshiba on 23/03/2017.
 */
argus
  .controller('nominaCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal',
    function ($scope, $rootScope, alertService, $uibModal) {

      //public var
      var vm = this;
      vm.mouthArray = new Array(12);
      vm.mouthArray [0] = {mouth: "Enero"};
      vm.mouthArray [1] = {mouth: "Febrero"};
      vm.mouthArray [2] = {mouth: "Marzo"};
      vm.mouthArray [3] = {mouth: "Abril"};
      vm.mouthArray [4] = {mouth: "Mayo"};
      vm.mouthArray [5] = {mouth: "Junio"};
      vm.mouthArray [6] = {mouth: "Julio"};
      vm.mouthArray [7] = {mouth: "Agosto"};
      vm.mouthArray [8] = {mouth: "Septiembre"};
      vm.mouthArray [9] = {mouth: "Octubre"};
      vm.mouthArray [10] = {mouth: "Noviembre"};
      vm.mouthArray [11] = {mouth: "Diciembre"};


      var date = new Date();
      vm.year = date.getFullYear();
      vm.years = [];
      for(var i = 2017; i <= vm.year; i++ ){
        vm.years.push(i);
      }

      vm.mouth = vm.mouthArray[date.getMonth()];
      vm.fortnight = 1;
      vm.rangeOneForPaysheet = 0;
      vm.rangeTwoForPaysheet = 0;

      //public functions
      vm.generatePaysheet = generatePaysheet;

      //private functions
      function activate() {

      }
      activate();

      function generatePaysheet() {
        var findMouth = _.findIndex(vm.mouthArray, {'mouth': vm.mouth.mouth}) + 1;
        var formatMouth = ("0" + (findMouth)).slice(-2);

        if(vm.fortnight == 1){
          vm.rangeOneForPaysheet = vm.year + '' + formatMouth + '01';
          vm.rangeTwoForPaysheet = vm.year + '' + formatMouth + '15';
        }else{
          vm.rangeOneForPaysheet = vm.year + '' + formatMouth + '16';
          vm.rangeTwoForPaysheet = vm.year + '' + formatMouth + '31';
        }
        console.log(vm.rangeOneForPaysheet);
        console.log(vm.rangeTwoForPaysheet);
      }

    }
  ]);
