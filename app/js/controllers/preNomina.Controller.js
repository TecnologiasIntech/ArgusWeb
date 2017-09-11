argus
  .controller('preNominaCtrl', ['$location', '$scope', '$rootScope', 'alertService', 'dateService', 'objetService', 'user', '$uibModal',
    function ($location, $scope, $rootScope, alertService, dateService, objetService, user, $uibModal) {

      //public var
      var vm = this;
      vm.securityGuards = {};
      vm.guardKeyTmp = '';
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
      vm.getBackgroundColorOfTheDay = getBackgroundColorOfTheDay;
      vm.updateSalayOfGuard = updateSalayOfGuard;
      vm.openModal = openModal;

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

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/cambiarSueldo.modal.html',
          scope: $scope,
          size: 'xxm',
          backdrop: 'static'
        });
      }

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
                      $rootScope.$applyAsync();
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
              var incapacityRT = 0;
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
                    // lacks--;
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
                      'statusKey': attendanceDate,
                      'comment': guardInfo.observacion ? guardInfo.observacion : guardInfo.descripcion
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
                    'tipoPago': vm.securityGuards[guard].tipoPago ? vm.securityGuards[guard].tipoPago : '',
                    // 'salario': 1600,
                    'salario': vm.securityGuards[guard].usuarioSueldoBase,
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
                    'incapacidadRT': incapacityRT,
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
                $rootScope.$applyAsync();
              })
          })
      }

      function saveGuardSalarys(paySheets) {

        for (guard in paySheets) {
          vm.guardSalarys[guard] = {
            'salary': paySheets[guard].sueldoTotal
          }
        }

      }

      function exportToExcel() {

        alasql('SELECT * INTO XLSX("nomina.xlsx",{headers:true}) FROM ?', [vm.paySheet]);

      }

      function updatePaySheetOfGuard(dataToUpdateById, attribute, guardKey, dataPaySheetKey) {
        var update = {};

        if (attribute == 'prestamosOP') {
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
        var lacksTmp = 0;
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
        var incapacityRT = 0;

        for (day in paySheetDays) {
          switch (paySheetDays[day].status) {

            case 'A':
              assistence++;
              break;

            case 'P':
              permissions++;
              lacksTmp++;
              break;

            case 'PP':
              paidPermits++;
              break;

            case 'DL':
              restWorked++;
              // lacks--;
              break;

            case 'DLP':
              lacks--;
              lacksTmp--;
              break;

            case 'DT':
              doubleTurn++;
              break;

            case 'E':
              sick++;
              lacksTmp++;
              break;

            case 'NF':
              noSignature++;
              break;

            case 'I':
              incapacity++;
              lacksTmp++;
              break;

            case 'IRT':
              incapacityRT++;
              break;

            case 'V':
              vacation++;
              break;

            case 'F':
              lacks++;
              break;
          }
        }

        if (lacks <= 0 && lacksTmp <= 0) {
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
        vm.paySheet[guardKey]['incapacidadRT'] = incapacityRT;
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
        if (eventCode == 13) {
          vm.updateStatusOfGuard(datePaySheetKey, statusKey, paySheetKey, guardKey);
          vm.updateAllPaySheetOfGuard(guardStatus, 'asd', guardKey, guard);
        }
      }

      function getBackgroundColorOfTheDay(status) {
        var value = "";
        switch (status) {

          case 'F':
            value = 'background-color: #e74c3c';
            break;

          case 'DL':
            value = 'background-color: #E08283';
            break;

          case 'DLP':
            value = 'background-color: #E08283; padding-right: 0px; padding-left: 0px; width: 25px !important';
            break;

          case 'DT':
            value = 'background-color: #3498db';
            break;

          case 'D':
            value = 'background-color: #3498db';
            break;

          case 'V':
            value = 'background-color: #9b59b6';
            break;

          case 'I':
            value = 'background-color: #c0392b';
            break;

          case 'IRT':
            value = 'background-color: #c0392b; padding-right: 0px; padding-left: 0px; width: 25px !important';
            break;

          case 'E':
            value = 'background-color: #F1A9A0';
            break;

          case 'NF':
            value = 'background-color: #2ecc71';
            break;

          case 'P':
            value = 'background-color: #e67e22';
            break;

          case 'PP':
            value = 'background-color: #e67e22';
            break;

          default:
            value = 'background-color: white; color: black !important';
            break;

        }
        return value;
      }

      function updateSalayOfGuard(guardKey, newSalary) {

        firebase.database().ref('Argus/guardias/' + guardKey + '/usuarioSueldoBase/').update(newSalary);

        vm.paySheet[guardKey]['salario'] = newSalary;

      }
    }
  ])
;
