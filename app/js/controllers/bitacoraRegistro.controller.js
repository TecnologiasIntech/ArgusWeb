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


      // var d = new Date();
      // if (d.getMonth < 10) {
      //   vm.month = "0" + (d.getMonth + 1);
      // }
      // else {
      //   vm.month = d.getMonth + 1;
      // }
      // vm.date = d.getFullYear + vm.month + d.getUTCDate;
      //
      // vm.fullDate = d.getUTCDate + " de " + vm.months[vm.month] + " del " + d.getFullYear;

      //private functions
      function activate() {

        // firebase.database().ref('Argus/BitacoraRegistro/' + vm.date)
        //   .on(value, function(snapshot){
        //     vm.recordsCurrentDate = snapshot.val();
        //   });

        firebase.database().ref('Argus/supervisores/')
        .on('value', function (snapshot) {
          vm.supervisores = snapshot.val();
        });

      }
      activate();

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

      // function supervisorData( supervisores ){
      //   firebase.database().ref('Argus/supervisores/' + supervisores)
      //     .on('value', function(snapshot){
      //       vm.supervisorData = snapshot.val();
      //       zona = vm.supervisorData.usuarioZona;
      //       // console.log(vm.supervisorData.usuarioNombre);
      //       // console.log(vm.supervisorData.usuarioZona);
      //
      //
      //       supervisores = fecha[supervisores];
      //       for (var observaciones in supervisores) {
      //         console.log(observaciones);
      //         console.log(supervisores[observaciones].hora);
      //         console.log(supervisores[observaciones].observacion);
      //
      //         var hora = supervisores[observaciones].hora;
      //
      //         // vm.fullRecords.push({
      //         //   vm.fullDate: {
      //         //     vm.supervisorData.usuarioNombre:{
      //         //       vm.observacion:{
      //         //         'zona': vm.supervisorData.usuarioZona,
      //         //         'hora': supervisores[observaciones].hora,
      //         //         'observacion': supervisores[observaciones].observacion
      //         //       }
      //         //     }
      //         //   }
      //         // });
      //
      //         vm.fullRecords.push({
      //           'vm.fullDate':{
      //             supervisor: {
      //               observacion: {
      //                 zona: vm.supervisorData.usuarioZona,
      //                 'hora': hora,
      //                 observacion: supervisores[observaciones].observacion
      //               }
      //             }
      //           }
      //         });
      //
      //         console.log(vm.fullRecords);
      //       }
      //
      //     });
      //
      //
      // }

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

    }
  ]);
