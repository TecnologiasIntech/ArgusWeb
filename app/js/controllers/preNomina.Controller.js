argus
  .controller('preNominaCtrl', ['$location', '$scope', '$rootScope', 'alertService', 'dateService', 'objetService', '$http',
    function ($location, $scope, $rootScope, alertService, dateService, objetService, $http) {

      //public var
      var vm = this;
      vm.securityGuards = {};
      vm.paySheet = {};
      vm.restWorkedPayment = 250;
      vm.doubleTurnPayment = 300;
      vm.assistencePayment = 0;
      vm.extraHoursPayment = 0;
      vm.salary = 1600;
      vm.services = {};
      vm.toDate = new Date();
      vm.rangeOfDates = {};
      vm.searchByGuardName = '';
      vm.searchByService = '';
      vm.searchByZone = '';
      vm.objectService = objetService;
      vm.isLoading = false;

      //public functions
      vm.getPaySheet = getPaySheet;
      vm.exportToExcel = exportToExcel;
      vm.updatePaySheetOfGuard = updatePaySheetOfGuard;

      //private functions
      function activate() {

        firebase.database().ref('Argus/guardias')
          .once('value', function (dataSnapshot) {
            vm.securityGuards = dataSnapshot.val();
          })

        firebase.database().ref('Argus/Clientes')
          .once('value', function (dataSnapshot) {
            vm.services = dataSnapshot.val();
          })
      }

      activate();

      function getPaySheet(fromDate, toDate) {
        vm.isLoading = true;

        vm.fDate = parseInt(dateService.getDateFormatWithOnlyNumbers(fromDate));
        vm.tDate = parseInt(dateService.getDateFormatWithOnlyNumbers(toDate));

        firebase.database().ref('Argus/Nomina/' + vm.fDate + 'to' + vm.tDate)
          .once('value', function (dataSnapshot) {
            var data = dataSnapshot.val();

            alertService.confirmOrCancel('Pre-nomina en existencia', '¿Desea continuar con la pre-nomina existente?', 'Si, continuar', 'No, sobreescribir').then(function (response) {
              if (response) {
                vm.paySheet = data;
                vm.isLoading = false;
                // $rootScope.$apply();
              } else {
                firebase.database().ref('Argus/Bitacora')
                  .orderByChild('fecha')
                  .startAt(vm.fDate)
                  .endAt(vm.tDate)
                  .once('value', function (dataSnapshot) {
                    var attendanceList = dataSnapshot.val();

                    for (guard in vm.securityGuards) {
                      var lacks = 0;
                      var isBondForAssistence = false;
                      var assistence = 0;
                      var doubleTurn = 0;
                      var restWorked = 0;
                      var extraHours = 0;
                      var totalSalary = 0;
                      var existGuard = false;
                      var doubleTurnTotal = 0;
                      var restWorkedTotal = 0;
                      var lacksTotal = 0;
                      var extraHoursTotal = 0;
                      var statusOfDays = {};
                      var sick = 0;
                      var noSignature = 0;
                      var vacation = 0;
                      var incapacity = 0;
                      var isLack = true;

                      for (attendanceDate in attendanceList) {

                        vm.rangeOfDates[attendanceDate] = {
                          'letterDay': dateService.getDayOfWeekWithDateInNumbersTogether(attendanceDate),
                          'numberDay': ( attendanceDate.toString() ).substr(6, 2)
                        }
                        if (guard == '-KkqU92w0BaiA3elmdKi') {
                          console.log('gola')
                        }

                        if (objetService.existInObject(attendanceList[attendanceDate], guard)) {
                          var guardInfo = attendanceList[parseInt(attendanceDate)][guard];
                          if (guardInfo.asistio) {
                            statusOfDays[attendanceDate] = 'A';
                            isLack = false;
                            assistence++;
                          }
                          if (guardInfo.cubreDescanso) {
                            statusOfDays[attendanceDate] = 'DL';
                            isLack = false;
                            restWorked++;
                            lacks--;
                          }
                          if (guardInfo.dobleTurno) {
                            statusOfDays[attendanceDate] = 'DT';
                            isLack = false;
                            doubleTurn++;
                          }
                          if (guardInfo.enfermo) {
                            statusOfDays[attendanceDate] = 'E';
                            isLack = false;
                            sick++;
                          }
                          if (guardInfo.noFirma) {
                            statusOfDays[attendanceDate] = 'NF';
                            isLack = false;
                            noSignature++;
                          }
                          if (guardInfo.incapacidad) {
                            statusOfDays[attendanceDate] = 'I';
                            isLack = false;
                            incapacity++;
                          }
                          if (guardInfo.vacaciones) {
                            statusOfDays[attendanceDate] = 'V';
                            isLack = false;
                            vacation++;
                          }
                          if (guardInfo.descanso) {
                          }
                          if (guardInfo.horasExtra) {
                            extraHours += guardInfo.horasExtra;
                            isLack = false;
                          }
                          if (isLack) {
                            statusOfDays[attendanceDate] = 'F';
                            lacks++;
                          }
                          isLack = true;
                          existGuard = true;
                        } else if (vm.securityGuards[guard].diaDescanso == dateService.getDayOfWeekAsNumber(attendanceDate)) {
                          statusOfDays[attendanceDate] = 'D';
                        } else {
                          statusOfDays[attendanceDate] = 'F';
                          lacks++;
                        }
                      }

                      if (lacks <= 0) {
                        isBondForAssistence = true;
                      }

                      doubleTurnTotal = doubleTurn * vm.doubleTurnPayment;
                      restWorkedTotal = restWorked * vm.restWorkedPayment;
                      extraHoursTotal = extraHours * vm.extraHoursPayment;
                      var totalExtras = restWorkedTotal + doubleTurnTotal + extraHoursTotal;

                      var descuentoFalta = ( isBondForAssistence ? 0 : vm.securityGuards[guard].usuarioSueldoBase == 0 ? 0 : 1600 - vm.securityGuards[guard].usuarioSueldoBase );
                      var totalExtrasYFaltas = totalExtras - descuentoFalta;
                      var bond = vm.securityGuards[guard].usuarioSueldoBase == 0 ? 0 : vm.securityGuards[guard].usuarioSueldoBase - 1600;
                      var subTotal = ( totalExtrasYFaltas < 0 ? bond + totalExtrasYFaltas : totalExtrasYFaltas + bond );

                      if (vm.securityGuards[guard].usuarioClienteAsignado != null) {

                        firebase.database().ref('Argus/Nomina/' + vm.fDate + 'to' + vm.tDate + '/' + guard)
                          .update({
                            'nombreGuardia': vm.securityGuards[guard].usuarioNombre,
                            'guardiaKey': guard,
                            'nominaKey': vm.fDate + 'to' + vm.tDate,
                            'zona': vm.services[vm.securityGuards[guard].usuarioClienteAsignado].clienteZonaAsignada,
                            'servicio': vm.securityGuards[guard].usuarioClienteAsignado,
                            'salario': 1600,
                            'asistencias': assistence,
                            'status': statusOfDays,
                            'inasistencias': lacks,
                            'descansosLaborados': restWorked,
                            'descansosLaboradosTotal': restWorkedTotal,
                            'dobleTurnos': doubleTurn,
                            'dobleTurnosTotal': doubleTurnTotal,
                            'horasExtras': extraHours,
                            'horasExtrasTotal': extraHoursTotal,
                            'totalExtras' : totalExtras,
                            'totalExtrasYFaltas' : totalExtrasYFaltas,
                            'subTotal' :  subTotal,
                            'sueldoTotal': subTotal,
                            'permiso': 0,
                            'premisoPagado': 0,
                            'enfermo': sick,
                            'noFirmo': noSignature,
                            'incapacidad': incapacity,
                            'vacaciones': vacation,
                            'comentariosGenerales': '',
                            'prestamosOP': '',
                            'descuentoPorFalta': descuentoFalta,
                            'bono': bond
                          })
                      }
                    }

                    firebase.database().ref('Argus/Nomina/' + vm.fDate + 'to' + vm.tDate)
                      .once('value', function (dataSnapshot2) {
                        vm.paySheet = dataSnapshot2.val();
                        console.log(vm.rangeOfDates);
                        console.log(statusOfDays);
                        vm.isLoading = false;
                        $rootScope.$apply();
                      })
                  })

              }
            })
          })

      }

      function exportToExcel() {

        alasql('SELECT * INTO XLSX("nomina.xlsx",{headers:true}) FROM ?', [vm.paySheet]);

      }

      function updatePaySheetOfGuard(dataToUpdateById, attribute, guardKey, dataPaySheetKey) {
        var update = {};

        console.log(dataPaySheetKey + ' ' + guardKey + ' ' + attribute + ' ' + document.getElementById(dataToUpdateById).value)
        update['Argus/Nomina/' + dataPaySheetKey + '/' + guardKey + '/' + attribute] = document.getElementById(dataToUpdateById).value;

        firebase.database().ref().update(update);
      }

    }
  ])
;
