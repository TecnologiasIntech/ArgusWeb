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
      vm.guardias = {};
      vm.nominasGeneradas = {};
      vm.fechas = {};
      vm.asistencias = {};
      vm.nomina = [];
      vm.nominaAnterior = {};
      vm.nominaFirebase = {};
      vm.numQuincena = '';
      vm.assistence=0;
      vm.assistence_cubreG=0;
      vm.assistence_dobleT=0;
      vm.estadoNomina = 0;
      vm.quincena = '';
      vm.sueldoBase=0;
      vm.sueldoTotal = 0;
      vm.rangoInicial = '';
      vm.totalPagado = 0;
      vm.exportToCsv = [];


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
      vm.date = '20170323';


      //public functions
      vm.generatePaysheet = generatePaysheet;
      vm.downloadCSV = downloadCSV;


      //private functions
      function activate() {

      }
      activate();

      function generatePaysheet() {

        vm.totalPagado=0;
        vm.nomina= [];

        var findMouth = _.findIndex(vm.mouthArray, {'mouth': vm.mouth.mouth}) + 1;
        var formatMouth = ("0" + (findMouth)).slice(-2);


        // Fortnight es el valor de los radios buttons al elegir entre "Quincena 1" y "Quincena 2"
        if(vm.fortnight == 1){
          vm.rangeOneForPaysheet = vm.year + '' + formatMouth + '01';
          vm.rangeTwoForPaysheet = vm.year + '' + formatMouth + '15';
        }else{
          vm.rangeOneForPaysheet = vm.year + '' + formatMouth + '16';
          vm.rangeTwoForPaysheet = vm.year + '' + formatMouth + '31';
        }

        /*Deducimos el numero de quincena mediante los ultimos dos digitos de la fecha inicial*/
        vm.quincena = vm.rangeOneForPaysheet.substr(6, 7);
        vm.nominaAnterior = {};
        /*Dependiendo del numero de quincena deducida asignamos un identificador*/
        if (vm.quincena == '01') {
          vm.numQuincena = vm.mouth.mouth + '-Uno';
          // firebase.database().ref('Argus/Nomina/'+ vm.mouthArray[findMouth]+'-Dos')
          // .on('value', function(snapshot){
          //   vm.nominaAnterior = snapshot.val();
          //
          //   for (var variable in object) {
          //
          //   }
          // });
        }
        else {
          vm.numQuincena= vm.mouth.mouth + '-Dos';
          // firebase.database().ref('Argus/Nomina/'+ vm.numQuincena)
          // .on('value', function(snapshot){
          //   vm.nominaAnterior = snapshot.val();
          //
          //   for (var variable1 in vm.nominaAnterior) {
          //
          //   }
          // });
        }


        /*Codigo para obtener todos los guardias*/
        firebase.database().ref('Argus/guardias')
          .on('value', function (snapshot) {
            vm.guardias = snapshot.val();
            // console.log(vm.guardias);
        });

        /*Obtener las nomimas ya generadas*/
        firebase.database().ref('Argus/Nomina')
        .on('value', function(snapshot){
          vm.nominasGeneradas = snapshot.val();
        });
        /*Codigo para obtener todos las asistencias de la bitacora*/
        firebase.database().ref('Argus/Bitacora')
          .orderByChild('fecha')
          .startAt(vm.rangeOneForPaysheet)
          .endAt(vm.rangeTwoForPaysheet)
          .on('value', function (snapshot) {
            vm.fechas = snapshot.val();



            firebase.database().ref('Argus/Nomina').child(vm.numQuincena).remove();

            vm.nomina = [];
            /*Si la quincena no existe en la base de datos la generamos*/

            for (var guardia in vm.guardias) {
              vm.sueldoTotal=0;
              for (var asistencias in vm.fechas) {
                vm.asistencias = vm.fechas[asistencias];
                for (var asistencia in vm.asistencias) {
                  /*Contabilizamos las asistencias de cada guardia de datos obtenidps de la bitacora con su registro y status*/
                  if (vm.asistencias[asistencia].guardiaNombre == vm.guardias[guardia].usuarioNombre && vm.asistencias[asistencia].asistio) {
                    if (vm.asistencias[asistencia].asistio) {
                      vm.assistence+=1;
                    }
                    if (vm.asistencias[asistencia].dobleTurno) {
                      vm.sueldoTotal+=250;
                      vm.assistence_cubreG+=1;
                    }
                    if (vm.asistencias[asistencia].cubreDescanso) {
                      vm.sueldoTotal+=300;
                      vm.assistence_dobleT+=1;
                    }
                  }
                }
              }
              if (vm.guardias[guardia].usuarioTipoGuardia == 'guardiaJefe') {
                vm.sueldoBase=266;
                vm.sueldoTotal+= (vm.sueldoBase * vm.assistence) + 400;
              }
              else {
                vm.sueldoBase=200;
                vm.sueldoTotal += (vm.sueldoBase * vm.assistence) + 400;
              }

              firebase.database().ref('Argus/Nomina/'+ vm.numQuincena).push({
                'nombreGuardia': vm.guardias[guardia].usuarioNombre,
                'sueldoBase': vm.sueldoBase,
                'asistencia': vm.assistence,
                'cubreGuardias': vm.assistence_cubreG,
                'dobleTurno': vm.assistence_dobleT,
                'sueldoTotal': vm.sueldoTotal
              });

              vm.nomina.push({
                'nombreGuardia': vm.guardias[guardia].usuarioNombre,
                'sueldoBase': vm.sueldoBase,
                'asistencia': vm.assistence,
                'cubreGuardias': vm.assistence_cubreG,
                'dobleTurno': vm.assistence_dobleT,
                'sueldoTotal': vm.sueldoTotal
              });

              vm.assistence = 0;
            }
            vm.nominaLength = vm.nomina.length;

            /*Sumamos todos los sueldoTotales de los empleados en vm.totalPagado*/
            for (var empleado in vm.nomina) {
              vm.totalPagado += vm.nomina[empleado].sueldoTotal;
            }
            firebase.database().ref('Argus/Nomina/'+ vm.numQuincena).child('totalPagado').set(vm.totalPagado);

            $rootScope.$apply();
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

        var csv = convertArrayOfObjectsToCSV({
          data: vm.exportToCsv
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
