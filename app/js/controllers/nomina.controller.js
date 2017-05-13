/**
 * Created by Toshiba on 23/03/2017.
 */
argus
  .controller('nominaCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl','$location', '$timeout',
    function ($scope, $rootScope, alertService, $uibModal, growl, $location, $timeout) {

      //public var
      var vm = this;

      vm.monthArray = new Array(12);
      vm.monthArray [0] = {month: "Enero"};
      vm.monthArray [1] = {month: "Febrero"};
      vm.monthArray [2] = {month: "Marzo"};
      vm.monthArray [3] = {month: "Abril"};
      vm.monthArray [4] = {month: "Mayo"};
      vm.monthArray [5] = {month: "Junio"};
      vm.monthArray [6] = {month: "Julio"};
      vm.monthArray [7] = {month: "Agosto"};
      vm.monthArray [8] = {month: "Septiembre"};
      vm.monthArray [9] = {month: "Octubre"};
      vm.monthArray [10] = {month: "Noviembre"};
      vm.monthArray [11] = {month: "Diciembre"};
      vm.guardias = {};
      vm.nominasGeneradas = {};
      vm.fechas = {};
      vm.asistencias = {};
      vm.nomina = [];
      vm.fechasQuincenaAnterior = {};
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
      vm.inasistencias = 0;
      vm.bono = 'No';
      vm.loading = false;
      vm.salary = 0;
      vm.bond = 0;
      vm.config = {};
      vm.paysheetSettings = {};
      vm.horasExtras = 0;


      var date = new Date();
      vm.year = date.getFullYear();
      vm.years = [];
      for(var i = 2017; i <= vm.year; i++ ){
        vm.years.push(i);
      }

      vm.month = vm.monthArray[date.getMonth()];
      vm.fortnight = 1;
      vm.rangeOneForPaysheet = 0;
      vm.rangeTwoForPaysheet = 0;
      vm.date = '20170323';


      //public functions
      vm.generatePaysheet = generatePaysheet;
      vm.downloadCSV = downloadCSV;
      vm.openModal = openModal;
      vm.settingsUpdate= settingsUpdate;

      //private functions
      function activate() {

        // var user = firebase.auth().currentUser;
        // $timeout( function(){
        //   if (user) {
        //     // User is signed in.
        //   } else {
        //     $location.path('/login');
        //     // $rootScope.$apply();
        //   }
        // }, 100 );

        /*Codigo para obtener todos los guardias*/
        firebase.database().ref('Argus/guardias')
          .on('value', function (snapshot) {
            vm.guardias = snapshot.val();
            // console.log(vm.guardias);
        });
      }

      activate();

      vm.script = script;
      function script() {
        var fecha = 20170401;

        for(fecha; fecha <= 20170415; fecha++){
          if(fecha == 20170415){
            firebase.database().ref('Argus/Bitacora/' + fecha + '/-KhZRSL02I7Csjl-hHBZ').set({
              asistio: false,
              cubreDescanso: true,
              dobleTurno: false,
              guardiaNombre: "CERVANTES BALDENEBRO JESUS RAMON"
            })
          }else{
            firebase.database().ref('Argus/Bitacora/' + fecha + '/-KhZRSL02I7Csjl-hHBZ').set({
              asistio: true,
              cubreDescanso: false,
              dobleTurno: false,
              guardiaNombre: "CERVANTES BALDENEBRO JESUS RAMON"
            })
          }
        }

      }

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/paysheetSettings.modal.html',
          scope: $scope,
          size: 'sn',
          backdrop: 'static'
        });
      }

      function generatePaysheet() {

        vm.totalPagado = 0;
        vm.nomina = [];
        vm.fechasQuincenaAnterior = {};
        vm.loading = true;

                                                          //  indice  nombreMes
        var findmonth = _.findIndex(vm.monthArray, {'month': vm.month.month}) + 1;

        // Da formato a los meses que son del 1 al 9 => 01,02,03,04.....
        var formatmonth = ("0" + (findmonth)).slice(-2);

        // Fotrnight == Quincena
        // Fortnight es el valor de los radios buttons al elegir entre "Quincena 1" y "Quincena 2"
        if(vm.fortnight == 1){
          vm.rangeOneForPaysheet = vm.year + '' + formatmonth + '01';
          vm.rangeTwoForPaysheet = vm.year + '' + formatmonth + '15';
        }else{
          vm.rangeOneForPaysheet = vm.year + '' + formatmonth + '16';
          vm.rangeTwoForPaysheet = vm.year + '' + formatmonth + '31';
        }

        /*Deducimos el numero de quincena mediante los ultimos dos digitos de la fecha inicial*/
        vm.quincena = vm.rangeOneForPaysheet.substr(6, 7);
        /*Dependiendo del numero de quincena deducida asignamos un identificador*/
        if (vm.quincena == '01') {
          vm.numQuincena = vm.month.month + '-Uno';
          findmonth -=1;
          if (findmonth<10) {
            findmonth = '0' + findmonth;
          }

          firebase.database().ref('Argus/Bitacora')
            .orderByChild('fecha')
            .startAt(vm.year + findmonth + '25')
            .endAt(vm.year + findmonth + '31')
            .on('value', function (snapshot) {
              vm.fechasQuincenaAnterior = snapshot.val();
            });
        }
        else {
          vm.numQuincena= vm.month.month + '-Dos';
          if (findmonth<10) {
            findmonth = '0' + findmonth;
          }
          firebase.database().ref('Argus/Bitacora')
            .orderByChild('fecha')
            .startAt(vm.year + findmonth + '09')
            .endAt(vm.year + findmonth + '15')
            .on('value', function (snapshot) {
              vm.fechasQuincenaAnterior = snapshot.val();
            });
        }

        /*Codigo para obtener todos las asistencias de la bitacora*/
        firebase.database().ref('Argus/Bitacora')
          .orderByChild('fecha')
          .startAt(vm.rangeOneForPaysheet)
          .endAt(vm.rangeTwoForPaysheet)
          .on('value', function (snapshot) {
            vm.fechas = snapshot.val();
            vm.nomina = [];
            vm.totalPagado = 0;

            /*Si la quincena no existe en la base de datos la generamos*/
            for (var guardia in vm.guardias) {
              vm.sueldoTotal = 0;
              vm.inasistencias = 0;
              vm.asistenciaBono = 0;
              vm.horasExtras = 0;

              for (var fecha in vm.fechasQuincenaAnterior) {
                var asistencias = vm.fechasQuincenaAnterior[fecha];
                for (var Guardia in asistencias) {
                  if (asistencias[Guardia].guardiaNombre == vm.guardias[guardia].usuarioNombre) {
                    if (asistencias[Guardia].asistio == false && asistencias[Guardia].cubreDescanso == false && asistencias[Guardia].dobleTurno == false) {
                      vm.inasistencias += 1;
                    }else{
                      vm.asistenciaBono += 1;
                    }
                    break;
                  }
                }
              }

              for (var fecha in vm.fechas) {
                vm.asistencias = vm.fechas[fecha];
                for (var asistencia in vm.asistencias) {

                  /*Contabilizamos las asistencias de cada guardia de datos obtenidos de la bitacora con su registro y status*/
                  if (vm.asistencias[asistencia].guardiaNombre == vm.guardias[guardia].usuarioNombre) {

                    if (vm.asistencias[asistencia].asistio == false && vm.asistencias[asistencia].cubreDescanso == false && vm.asistencias[asistencia].dobleTurno == false) {

                      vm.inasistencias += 1;
                    }
                    else {

                      if (vm.asistencias[asistencia].asistio) {
                        vm.assistence += 1;
                        vm.asistenciaBono += 1;
                      }
                      if (vm.asistencias[asistencia].cubreDescanso) {
                        vm.sueldoTotal += 250;
                        vm.assistence_cubreG += 1;
                      }
                      if (vm.asistencias[asistencia].dobleTurno ) {
                        vm.sueldoTotal += 300;
                        vm.assistence_dobleT += 1;
                      }
                      if(vm.asistencias[asistencia].horasExtra){
                        vm.sueldoTotal += vm.asistencias[asistencia].horasExtra * 20;
                        vm.horasExtras += vm.asistencias[asistencia].horasExtra;
                      }
                    }
                  }
                }
              }

              vm.sueldoBase = calculateBaseSalary(vm.fortnight, vm.month.month, vm.year, 1600);
              vm.sueldoTotal += (vm.sueldoBase * vm.assistence);
              vm.salary = vm.sueldoTotal;


              if (vm.inasistencias == 0 && vm.asistenciaBono >= 12) {
                vm.sueldoTotal += vm.guardias[guardia].usuarioSueldoBase - 1600;
                vm.bonoTotal += vm.guardias[guardia].usuarioSueldoBase - 1600;
                vm.bono = 'Si';
              }

              firebase.database().ref('Argus/Nomina/'+ vm.numQuincena + '/' + guardia).update({
                'nombreGuardia': vm.guardias[guardia].usuarioNombre,
                'sueldoBase': vm.sueldoBase,
                'asistencia': vm.assistence,
                'inasistencias': vm.inasistencias,
                'cubreGuardias': vm.assistence_cubreG,
                'dobleTurno': vm.assistence_dobleT,
                'horasExtra': vm.horasExtras,
                'bono': vm.bono,
                'sueldoTotal': vm.sueldoTotal
              });

              vm.nomina.push({
                'nombreGuardia': vm.guardias[guardia].usuarioNombre,
                'sueldoBase': vm.sueldoBase,
                'asistencia': vm.assistence,
                'inasistencias': vm.inasistencias,
                'cubreGuardias': vm.assistence_cubreG,
                'dobleTurno': vm.assistence_dobleT,
                'horasExtra': vm.horasExtras,
                'bonoTotal': vm.bonoTotal,
                'sueldo': vm.salary,
                'sueldoTotal': vm.sueldoTotal
              });

              vm.exportToCsv.push({
                'nombreGuardia': vm.guardias[guardia].usuarioNombre,
                'sueldoBase': vm.sueldoBase,
                'asistencia': vm.assistence,
                'inasistencias': vm.inasistencias,
                'cubreGuardias': vm.assistence_cubreG,
                'dobleTurno': vm.assistence_dobleT,
                'horasExtra': vm.horasExtras,
                'bonoTotal': vm.bonoTotal,
                'sueldo': vm.salary,
                'sueldoTotal': vm.sueldoTotal
              });

              vm.assistence = 0;
              vm.assistence_cubreG = 0;
              vm.assistence_dobleT = 0;
              vm.bono = 'No';
            }
            vm.nominaLength = vm.nomina.length;

            /*Sumamos todos los sueldoTotales de los empleados en vm.totalPagado*/
            for (var empleado in vm.nomina) {
              vm.totalPagado += vm.nomina[empleado].sueldoTotal;
            }
            firebase.database().ref('Argus/Nomina/'+ vm.numQuincena).child('totalPagado').set(vm.totalPagado);
            // vm.exportToCsv = vm.nomina;
            vm.loading = false;
            $rootScope.$apply()

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

      function settingsUpdate() {

      }

      function calculateBaseSalary(quincena, month, year, salary) {
        var baseSalary = 0;



        if(quincena == 2) {
          if (month === 'Abril' || month === 'Junio' || month === 'Septiembre' || month === 'Noviembre') {
            baseSalary = salary / 13;
          } else if (month === 'Febrero') {
            if(year == 2020 || year == 2024 || year == 2028 || year == 2032 || year == 2036 || year == 2040 || year == 2044 || year == 2048 || year == 2052){
             baseSalary = salary / 12;
            }else {
              baseSalary = salary / 11;
            }
          } else {
            baseSalary = salary / 14;
          }
        }else{
          baseSalary = salary / 13;
        }

        return baseSalary;
      }
    }
  ]);
