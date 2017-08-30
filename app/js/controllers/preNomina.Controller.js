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
      vm.guardSalarys = {};

      //public functions
      vm.verifyPaySheet = verifyPaySheet;
      vm.exportToExcel = exportToExcel;
      vm.updatePaySheetOfGuard = updatePaySheetOfGuard;
      vm.updateStatusOfGuard = updateStatusOfGuard;
      vm.selectAllText = selectAllText;
      vm.updateAllPaySheetOfGuard = updateAllPaySheetOfGuard;
      vm.paySheetDays_keyUpEvent = paySheetDays_keyUpEvent;

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

      function verifyPaySheet(fromDate, toDate) {
        vm.isLoading = true;

        vm.fDate = parseInt(dateService.getDateFormatWithOnlyNumbers(fromDate));
        vm.tDate = parseInt(dateService.getDateFormatWithOnlyNumbers(toDate));
        vm.paySheet = {};

        firebase.database().ref('Argus/Nomina/' + vm.fDate + 'to' + vm.tDate)
          .once('value', function (dataSnapshot) {
            var data = dataSnapshot.val();

            if (data != null) {
              alertService.confirmOrCancel('Pre-nomina en existencia', '¿Desea continuar con la pre-nomina existente?', 'Si, continuar', 'No, sobreescribir').then(function (response) {
                if (response) {
                  //Obtener los dias de la nomina
                  firebase.database().ref('Argus/Bitacora')
                    .orderByChild('fecha')
                    .startAt(vm.fDate)
                    .endAt(vm.tDate)
                    .once('value', function (dataSnapshot) {
                      var attendanceList = dataSnapshot.val();

                      for (attendanceDate in attendanceList) {

                        vm.rangeOfDates[attendanceDate] = {
                          'letterDay': dateService.getDayOfWeekWithDateInNumbersTogether(attendanceDate),
                          'numberDay': ( attendanceDate.toString() ).substr(6, 2)
                        }
                      }

                      vm.paySheet = data;
                      saveGuardSalarys(vm.paySheet);
                      vm.isLoading = false;
                      $rootScope.$apply();
                    });
                } else {
                  getPaySheet();
                }
              })
            } else {
              getPaySheet();
            }
          })

      }

      function getPaySheet() {
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
                if (objetService.existInObject(attendanceList[attendanceDate], guard)) {
                  var guardInfo = attendanceList[parseInt(attendanceDate)][guard];
                  if (guardInfo.asistio) {
                    statusOfDays[attendanceDate] = {
                      'status': 'A',
                      'statusKey': attendanceDate
                    }
                    isLack = false;
                    assistence++;
                  }
                  if (guardInfo.cubreDescanso) {
                    statusOfDays[attendanceDate] = {
                      'status': 'DL',
                      'statusKey': attendanceDate
                    }
                    isLack = false;
                    restWorked++;
                    lacks--;
                  }
                  if (guardInfo.dobleTurno) {
                    statusOfDays[attendanceDate] = {
                      'status': 'DT',
                      'statusKey': attendanceDate
                    }
                    isLack = false;
                    doubleTurn++;
                  }
                  if (guardInfo.enfermo) {
                    statusOfDays[attendanceDate] = {
                      'status': 'E',
                      'statusKey': attendanceDate
                    }
                    isLack = false;
                    sick++;
                  }
                  if (guardInfo.noFirma) {
                    statusOfDays[attendanceDate] = {
                      'status': 'NF',
                      'statusKey': attendanceDate
                    }
                    isLack = false;
                    noSignature++;
                  }
                  if (guardInfo.incapacidad) {
                    statusOfDays[attendanceDate] = {
                      'status': 'I',
                      'statusKey': attendanceDate
                    }
                    isLack = false;
                    incapacity++;
                  }
                  if (guardInfo.vacaciones) {
                    statusOfDays[attendanceDate] = {
                      'status': 'V',
                      'statusKey': attendanceDate
                    }
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
                    statusOfDays[attendanceDate] = {
                      'status': 'F',
                      'statusKey': attendanceDate
                    }
                    lacks++;
                  }
                  isLack = true;
                  existGuard = true;
                } else if (vm.securityGuards[guard].diaDescanso == dateService.getDayOfWeekAsNumber(attendanceDate)) {
                  statusOfDays[attendanceDate] = {
                    'status': 'D',
                    'statusKey': attendanceDate
                  }
                } else {
                  statusOfDays[attendanceDate] = {
                    'status': 'F',
                    'statusKey': attendanceDate
                  }
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
                    'totalExtras': totalExtras,
                    'totalExtrasYFaltas': totalExtrasYFaltas,
                    'subTotal': subTotal,
                    'sueldoTotal': subTotal,
                    'permiso': 0,
                    'permisoPagado': 0,
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
                saveGuardSalarys(vm.paySheet);
                vm.isLoading = false;
                $rootScope.$apply();
              })
          })
      }

      function saveGuardSalarys(paySheets) {

        for(guard in paySheets){
          vm.guardSalarys[guard] = {
            'salary' : paySheets[guard].sueldoTotal
          }
        }

      }

      function exportToExcel() {

        alasql('SELECT * INTO XLSX("nomina.xlsx",{headers:true}) FROM ?', [vm.paySheet]);

      }

      function updatePaySheetOfGuard(dataToUpdateById, attribute, guardKey, dataPaySheetKey) {
        var update = {};

        if(attribute == 'prestamosOP') {
          var total = vm.guardSalarys[guardKey].salary;
          var prestamo = parseInt(document.getElementById(dataToUpdateById).value) >= 0 ? parseInt(document.getElementById(dataToUpdateById).value) : 0;
          total = prestamo + total;

          vm.paySheet[guardKey]['sueldoTotal'] = total;

          update['Argus/Nomina/' + dataPaySheetKey + '/' + guardKey + '/sueldoTotal'] = total;
        }

        update['Argus/Nomina/' + dataPaySheetKey + '/' + guardKey + '/' + attribute] = document.getElementById(dataToUpdateById).value;

        firebase.database().ref().update(update);
      }

      function updateStatusOfGuard(newStatusById, statusKey, dataPaySheetKey, guardKey) {
        var update = {};

        update['Argus/Nomina/' + dataPaySheetKey + '/' + guardKey + '/status/' + statusKey + '/status'] = document.getElementById(newStatusById).value;
        vm.paySheet[guardKey]['status'][statusKey]['status'] = document.getElementById(newStatusById).value;

        firebase.database().ref().update(update);

        // getPayShet();
      }

      function selectAllText(inputId) {
        document.getElementById(inputId).select();
      }

      function updateAllPaySheetOfGuard(paySheetDays, PaySheetKey, guardKey, guardPaySheet) {

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
        var permissions = 0;
        var paidPermits = 0;

        for (day in paySheetDays)
          switch (paySheetDays[day].status) {

          case 'A':
            isLack = false;
            assistence++;
            break;

          case 'P':
            permissions++;
            break;

          case 'PP':
            paidPermits++;
            break;

          case 'DL':
            isLack = false;
            restWorked++;
            lacks--;
            break;

          case 'DT':
            isLack = false;
            doubleTurn++;
            break;

          case 'E':
            isLack = false;
            sick++;
            break;

          case 'NF':
            isLack = false;
            noSignature++;
            break;

          case 'I':
            isLack = false;
            incapacity++;
            break;

          case 'V':
            isLack = false;
            vacation++;
            break;

          case 'F':
            lacks++;
            break;
        }

        if (lacks <= 0) {
          isBondForAssistence = true;
        }

        doubleTurnTotal = doubleTurn * vm.doubleTurnPayment;
        restWorkedTotal = restWorked * vm.restWorkedPayment;
        extraHoursTotal = guardPaySheet.horasExtrasTotal;
        var totalExtras = restWorkedTotal + doubleTurnTotal + extraHoursTotal;

        var descuentoFalta = ( isBondForAssistence ? 0 : vm.securityGuards[guardKey].usuarioSueldoBase == 0 ? 0 : 1600 - vm.securityGuards[guardKey].usuarioSueldoBase );
        var totalExtrasYFaltas = totalExtras - descuentoFalta;
        var bond = vm.securityGuards[guardKey].usuarioSueldoBase == 0 ? 0 : vm.securityGuards[guardKey].usuarioSueldoBase - 1600;
        var subTotal = ( totalExtrasYFaltas < 0 ? bond + totalExtrasYFaltas : totalExtrasYFaltas + bond );

        vm.paySheet[guardKey]['asistencias'] = assistence;
        vm.paySheet[guardKey]['inasistencias'] = lacks;
        vm.paySheet[guardKey]['descansosLaborados'] = restWorked;
        vm.paySheet[guardKey]['descansosLaboradosTotal'] = restWorkedTotal;
        vm.paySheet[guardKey]['dobleTurnos'] = doubleTurn;
        vm.paySheet[guardKey]['dobleTurnosTotal'] = doubleTurnTotal;
        vm.paySheet[guardKey]['horasExtras'] = extraHours;
        vm.paySheet[guardKey]['horasExtrasTotal'] = extraHoursTotal;
        vm.paySheet[guardKey]['totalExtras'] = totalExtras;
        vm.paySheet[guardKey]['totalExtrasYFaltas'] = totalExtrasYFaltas;
        vm.paySheet[guardKey]['subTotal'] = subTotal;
        vm.paySheet[guardKey]['sueldoTotal'] = subTotal;
        vm.paySheet[guardKey]['permiso'] = permissions;
        vm.paySheet[guardKey]['permisoPagado'] = paidPermits;
        vm.paySheet[guardKey]['enfermo'] = sick;
        vm.paySheet[guardKey]['noFirmo'] = noSignature;
        vm.paySheet[guardKey]['incapacidad'] = incapacity;
        vm.paySheet[guardKey]['vacaciones'] = vacation;
        vm.paySheet[guardKey]['descuentoPorFalta'] = descuentoFalta;
        vm.paySheet[guardKey]['bono'] = bond;

        firebase.database().ref('Argus/Nomina/' + vm.fDate + 'to' + vm.tDate + '/' + guardKey)
          .update({
            'asistencias': assistence,
            'inasistencias': lacks,
            'descansosLaborados': restWorked,
            'descansosLaboradosTotal': restWorkedTotal,
            'dobleTurnos': doubleTurn,
            'dobleTurnosTotal': doubleTurnTotal,
            'horasExtras': extraHours,
            'horasExtrasTotal': extraHoursTotal,
            'totalExtras': totalExtras,
            'totalExtrasYFaltas': totalExtrasYFaltas,
            'subTotal': subTotal,
            'sueldoTotal': subTotal,
            'permiso': permissions,
            'permisoPagado': paidPermits,
            'enfermo': sick,
            'noFirmo': noSignature,
            'incapacidad': incapacity,
            'vacaciones': vacation,
            'descuentoPorFalta': descuentoFalta,
            'bono': bond
          })
      }

      function paySheetDays_keyUpEvent(eventCode, datePaySheetKey, statusKey, paySheetKey, guardKey, guardStatus, guard) {
        if(eventCode == 13){
          vm.updateStatusOfGuard(datePaySheetKey, statusKey, paySheetKey, guardKey);
          vm.updateAllPaySheetOfGuard(guardStatus, 'asd', guardKey, guard);
        }
      }
    }
  ])
;
