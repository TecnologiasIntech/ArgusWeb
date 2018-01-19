/**
 * Created by Toshiba on 20/02/2017.
 */
argus
  .controller('clienteCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl', '$location', '$timeout', 'focusService', 'userService', 'objetService',
    function ($scope, $rootScope, alertService, $uibModal, growl, $location, $timeout, focusService, userService, objetService) {

      //public var
      var vm = this;
      vm.searchInCustomers = '';
      vm.searchInGuards = '';
      vm.customers = {};
      vm.guards = {};
      vm.client = {};
      vm.customersAvailable = [];
      vm.client.clienteDisponible = true;
      vm.isEdit = false;
      vm.guardsToClient = [];
      vm.view = 'general';
      vm.config = {};
      vm.isLoading = false;
      vm.saveGuardias = [];
      vm.saveClientes = [];
      vm.guardiasClienteEliminado = {};
      vm.consignasArray = {};
      vm.isAddConsigna = false;
      vm.consigna = {};
      vm.consigna.items = {};
      vm.isEditConsigna = false;
      vm.listResponsibles = [];
      vm.responsibleId = 1;
      vm.isEditResponsible;
      vm.listDaysSchedule = [];
      vm.guardInfo = {};
      vm.saveZona;
      vm.filter = '-clienteNombre';
      vm.serviceToSelect = {};
      vm.horarios = {};
      //   dasdasdas: {
      //     dias: {
      //       lunes: true,
      //       martes: true,
      //       miercoles: true,
      //       jueves: true,
      //       viernes: true,
      //       sabado: false,
      //       domingo: false
      //     },
      //     desdeHora: '8:00',
      //     hastaHora: '20:00'
      //   },
      //   asdasdas: {
      //     dias: {
      //       lunes: false,
      //       martes: false,
      //       miercoles: true,
      //       jueves: true,
      //       viernes: true,
      //       sabado: false,
      //       domingo: false
      //     },
      //     desdeHora: '8:00',
      //     hastaHora: '20:00'
      //   }
      // };
      vm.isEditHorario = false;
      vm.horario = {};
      vm.keyHorario = '';
      vm.objectService = objetService;

      //public functions
      vm.openModal = openModal;
      vm.openGuardiaDetails = openGuardiaDetails;
      vm.openModalNewHorario = openModalNewHorario;
      vm.openModalEditarHorario = openModalEditarHorario;
      vm.editClient = editClient;
      vm.deleteClient = deleteClient;
      vm.registerClient = registerClient;
      vm.addOrDeleteItemInAssignment = addOrDeleteItemInAssignment;
      vm.verifyChecked = verifyChecked;
      vm.updateClient = updateClient;
      vm.editClientCancel = editClientCancel;
      vm.addConsigna = addConsigna;
      vm.removeItem = removeItem;
      vm.addItemToConsigna = addItemToConsigna;
      vm.openModalToAsignTitleToConsigna = openModalToAsignTitleToConsigna;
      vm.deleteConsigna = deleteConsigna;
      vm.clearConsignas = clearConsignas;
      vm.verifyClientName = verifyClientName;
      vm.errorConsignaUndeclaredClientName = errorConsignaUndeclaredClientName;
      vm.deleteAllConsignas = deleteAllConsignas;
      vm.openModalAddResponsible = openModalAddResponsible;
      vm.saveResponsible = saveResponsible;
      vm.removeResponsible = removeResponsible;
      vm.editResponsible = editResponsible;
      vm.updateResponsible = updateResponsible;
      vm.daysSelected = daysSelected;
      vm.clearSchedule = clearSchedule;
      vm.moveGuardService = moveGuardService;
      vm.getServices = getServices;
      vm.openModalToMoveGuard = openModalToMoveGuard;
      vm.agregarHorario = agregarHorario;
      vm.editarHorario = editarHorario;
      vm.cerrarHorario = cerrarHorario;
      vm.borrarHorarios = borrarHorarios;
      vm.borrarHorario = borrarHorario;

      //private functions
      function activate() {

        vm.isLoading = true;
        firebase.database().ref('Argus/Clientes')
          .on('value', function (snapshot) {
            vm.customers = snapshot.val();
            vm.isLoading = false;
            // $rootScope.$apply();
            $timeout(function () {

            }, 200);
          });

        firebase.database().ref('Argus/guardias')
          .on('value', function (snapshot) {
            vm.guards = snapshot.val();
            $rootScope.$applyAsync();
          });

        firebase.database().ref('Argus/Zonas')
          .on('value', function (snapshot) {
            vm.zonas = snapshot.val();
          });

        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {

            if (user.providerData[0].providerId == 'password') {
              vm.usuarioNombre = user.email;

              userService.getUserType(user.email).then(function (response) {
                vm.userType = response;
              })
            } else {
              vm.usuarioNombre = user.displayName;
              vm.usuarioFotoPerfil = user.photoURL;
            }
          }
        });

      }

      activate();

      function openModal() {
        //saveGuardias=[];


        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/clientes.modal.html',
          scope: $scope,
          size: 'lm',
          backdrop: 'static'
        });
      }

      function openGuardiaDetails() {
        //saveGuardias=[];
        vm.modalGuardiaDetails = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/guardiasDetalles.modal.html',
          scope: $scope,
          size: 'xxm',
          backdrop: 'static'
        });
      }

      function openModalToAsignTitleToConsigna() {
        //saveGuardias=[];
        vm.modalConsigna = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/asignarNombreConsigna.modal.html',
          scope: $scope,
          size: 'c',
          backdrop: 'static'
        });
      }

      function openModalToMoveGuard() {
        vm.modalMoveGuard = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/moveGuard.modal.html',
          scope: $scope,
          size: 'ar',
          backdrop: 'static'
        });
      }

      function openModalNewHorario() {

        if (!vm.client.clienteNombre) {
          vm.view = 'general';
          growl.error('Tiene que asignar un nombre al Servicio antes de crear horarios', vm.config)
        } else {
          vm.modalNewHoraqrio = $uibModal.open({
            animation: true,
            templateUrl: 'views/modals/agregarHorario.modal.html',
            scope: $scope,
            size: 'lm',
            backdrop: 'static'
          });
        }
      }

      function openModalEditarHorario(keyHorario) {
        vm.isEditHorario = true;
        vm.horario = vm.horarios[keyHorario];
        vm.keyHorario = keyHorario;
        openModalNewHorario();
      }

      function getConsignas(consignaName) {

        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + consignaName)
          .on('value', function (snapshot) {

            vm.consigna.items = snapshot.val();

            $rootScope.$applyAsync();

          })

      }

      function getConsignasNames(consignaName) {

        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre)
          .on('value', function (snapshot) {

            vm.consignasArray = snapshot.val();

            $rootScope.$applyAsync();

          })

      }

      function editClient(client, clientName) {
        if (vm.userType == 'recursosHumanos' || vm.userType == 'coordinador' || vm.userType == 'administrador') {
          vm.isEdit = true;
          vm.client = client;
          getHorariosByClient(clientName);
          vm.saveZona = vm.client.clienteZonaAsignada;
          for (var guard in vm.client.clienteGuardias) {
            vm.saveGuardias.push(guard);
            vm.guardsToClient.push({
              usuarioNombre: vm.client.clienteGuardias[guard].usuarioNombre,
              usuarioKey: vm.client.clienteGuardias[guard].usuarioKey
            });
            firebase.database().ref('Argus/guardias/' + vm.client.clienteGuardias[guard].usuarioKey).update({
              usuarioDisponible: true
            });
          }

          // Obtener las consignas de este cliente
          getConsignasNames(clientName);

          // Obtener los responsables del cliente
          getResponsibles(clientName);

          //Obtener el horario
          // getSchedule(clientName);

          vm.openModal();
        }
      }

      function getHorariosByClient(clienteNombre) {
        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/Horarios')
          .on('value', function (dataSnapshot) {
            vm.horarios = dataSnapshot.val();
            $rootScope.$applyAsync();
          })
      }

      function editClientCancel() {
        for (var guard in vm.saveGuardias) {
          firebase.database().ref('Argus/guardias/' + vm.saveGuardias[guard]).update({
            usuarioDisponible: false
          });
        }
        vm.saveGuardias = [];
      }

      function deleteClient(client) {

        vm.guardiasClienteEliminado = {};

        firebase.database().ref('Argus/Clientes/' + client.clienteNombre).child('clienteGuardias')
          .on('value', function (snapshot) {
            vm.guardiasClienteEliminado = snapshot.val();
          });

        alertService.confirm('Eliminar cliente', '¿Estas seguro de que desea eliminar este cliente?').then(function () {

          for (var guardia in vm.guardiasClienteEliminado) {
            firebase.database().ref('Argus/guardias/' + guardia).update({
              'usuarioDisponible': true
            });
            firebase.database().ref('Argus/guardias/' + guardia).child('usuarioClienteAsignado').remove();
          }

          if (client.clienteZonaAsignada) {
            firebase.database().ref('Argus/Zonas/' + client.clienteZonaAsignada + '/zonaClientes/' + client.clienteNombre).remove();
          }

          growl.error('Cliente Eliminado!', vm.config);

          firebase.database().ref('Argus/Clientes/' + client.clienteNombre).remove();
        });


      }

      function serviceExists(service) {
        var data = false;
        firebase.database().ref('Argus/Clientes/' + service)
          .once('value', function (dataSnapshot) {
            data = dataSnapshot.val();
          });

        if (data != null) {
          return true;
        } else {
          return false;
        }

      }

      function registerClient() {

        if (serviceExists(vm.client.clienteNombre)) {

          alertService.error("Servicio existente", "El servicio ya existe, intente con otro nombre");

        } else {

          if (vm.client.clienteZonaAsignada != undefined && vm.client.clienteZonaAsignada != "Sin Asignar") {
            vm.client.clienteDisponible = false;
          }
          else {
            vm.client.clienteDisponible = true;
          }
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre).set(vm.client);

          //Agregar referencia del servicio en la zona
          firebase.database().ref('Argus/Zonas/' + vm.client.clienteZonaAsignada + '/zonaClientes/' + vm.client.clienteNombre).set({
            clienteNombre: vm.client.clienteNombre
          });

          for (var i = 0; i < vm.guardsToClient.length; i++) {
            // Asignar los guardias al cliente
            firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias/' + vm.guardsToClient[i].usuarioKey).set({
              usuarioNombre: vm.guardsToClient[i].usuarioNombre,
              usuarioKey: vm.guardsToClient[i].usuarioKey
            });

            // Agregar referencia del cliente en el guardia
            var updates = {};
            updates['Argus/guardias/' + vm.guardsToClient[i].usuarioKey + '/usuarioClienteAsignado'] = vm.client.clienteNombre;
            updates['Argus/guardias/' + vm.guardsToClient[i].usuarioKey + '/usuarioDisponible'] = false;
            firebase.database().ref().update(updates);

          }

          // Agregar responsables a cliente
          // var domicilio = ""; //variable auxiliar para concatenar los campos del domicilio
          for (var responsible in vm.listResponsibles) {
            domicilio = vm.listResponsibles[responsible].responsibleColony + "," + vm.listResponsibles[responsible].responsibleStreet;
            firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteResponsables').push({
              responsableNombre: vm.listResponsibles[responsible].responsibleName,
              responsableTelefono: vm.listResponsibles[responsible].responsiblePhone,
              responsableDomicilio: domicilio,
              responsableCorreo: vm.listResponsibles[responsible].responsibleEmail
            });
          }

          vm.client = {};
          vm.client.clienteDisponible = true;
          vm.guardsToClient = [];
          vm.listResponsibles = [];
          vm.listDaysSchedule = [];
          vm.responsibleId = 1;
          growl.success('Cliente Agregado!', vm.config);
          vm.modal.dismiss();
        }
      }

      function addOrDeleteItemInAssignment(guard, guardKey) {
        //noinspection JSDuplicatedDeclaration
        var guardObj = guard;
        var guardIndex = _.findIndex(vm.guardsToClient, {'usuarioNombre': guardObj.usuarioNombre});

        if (guardIndex == -1) {
          vm.guardsToClient.push({
            usuarioNombre: guardObj.usuarioNombre,
            // usuarioTurno: guardObj.usuarioTurno,
            usuarioKey: guardKey
          })
        } else {
          vm.guardsToClient.splice(guardIndex, 1);
        }
      }

      function verifyChecked(guard) {
        var checked;

        checked = _.findIndex(vm.guardsToClient, {'usuarioNombre': guard});

        return checked;
      }

      function updateClient() {
        // for (var guardia in vm.saveGuardias) {
        //   firebase.database().ref('Argus/guardias/'+ vm.saveGuardias[guardia]).child('usuarioClienteAsignado').remove();
        // }
        vm.saveGuardias = [];
        //Actulizar referencia del servicio en la zona
        if (vm.saveZona != vm.client.clienteZonaAsignada) {
          firebase.database().ref('Argus/Zonas/' + vm.saveZona + '/zonaClientes/' + vm.client.clienteNombre).remove();
          firebase.database().ref('Argus/Zonas/' + vm.client.clienteZonaAsignada + '/zonaClientes').child(vm.client.clienteNombre).set({
            clienteNombre: vm.client.clienteNombre
          });
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre).update({
            clienteZonaAsignada: vm.client.clienteZonaAsignada
          });
        }

        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre).update({
          clienteDomicilio: vm.client.clienteDomicilio,
          clienteZonaAsignada: vm.client.clienteZonaAsignada ? vm.client.clienteZonaAsignada : ''
        });

        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias').remove();

        for (var i = 0; i < vm.guardsToClient.length; i++) {
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias/' + vm.guardsToClient[i].usuarioKey).set({
            usuarioNombre: vm.guardsToClient[i].usuarioNombre,
            usuarioKey: vm.guardsToClient[i].usuarioKey
          });

          // Agregar referencia del cliente en el guardia
          var updates = {};
          updates['Argus/guardias/' + vm.guardsToClient[i].usuarioKey + '/usuarioClienteAsignado'] = vm.client.clienteNombre;
          updates['Argus/guardias/' + vm.guardsToClient[i].usuarioKey + '/usuarioDisponible'] = false;
          firebase.database().ref().update(updates);

        }
        // Agregar responsables actualizados a cliente
        var domicilio = ""; //variable auxiliar para concatenar los campos del domicilio
        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteResponsables').remove();

        for (var responsible in vm.listResponsibles) {
          domicilio = vm.listResponsibles[responsible].responsibleColony + "," + vm.listResponsibles[responsible].responsibleStreet;
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteResponsables').push({
            responsableNombre: vm.listResponsibles[responsible].responsibleName,
            responsableTelefono: vm.listResponsibles[responsible].responsiblePhone,
            responsableDomicilio: domicilio,
            responsableCorreo: vm.listResponsibles[responsible].responsibleEmail
          });
        }
        getResponsibles(vm.client.clienteNombre);

        vm.client = {};
        vm.client.clienteDisponible = true;
        vm.guardsToClient = [];
        // vm.listResponsibles = [];
        vm.listDaysSchedule = [];
        vm.isEdit = false;
        vm.view = 'general';
        growl.info('Cliente Actualizado!', vm.config);

      }

      function addConsigna(titleConsigna) {

        if (!titleConsigna) {
          growl.error('No puedes agregar una consigna vacía', vm.config);
        } else {

          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + titleConsigna)
            .once('value', function (snapshot) {

              var existConsigna = snapshot.val();
              if (!existConsigna) {
                vm.isAddConsigna = true;

                firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + titleConsigna).set({
                  prueba: {
                    consignaNombre: 'Prueba'
                  }
                });
                // getConsignas( vm.client.clienteNombre );
              }
            });

          vm.modalConsigna.dismiss();
          vm.consigna = {};
        }
      }

      function verifyClientName(consignaName) {

        if (!vm.client.clienteNombre) {
          vm.view = 'general';
          growl.error('Tiene que asignar un nombre al Servicio antes de crear consignas', vm.config)
        } else {
          // vm.view = 'consignas'
          vm.openModalToAsignTitleToConsigna();
          vm.consigna.nombre = consignaName;
          vm.consignaTarea = "";
          getConsignas(consignaName)
        }

      }

      function addItemToConsigna(consignaTarea) {

        // Añade la nueva tarea
        if (!consignaTarea) {
          growl.error('No puedes agregar una tarea vacía', vm.config);
        } else if (!vm.consigna.nombre) {
          growl.error('No puedes agregar una tarea a una consigna sin nombre', vm.config);
        } else {

          // Elimina la tarea de prueba
          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + vm.consigna.nombre + '/prueba').remove();

          // Agregamos la tarea a la consigna
          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + vm.consigna.nombre).push({
            consignaNombre: consignaTarea
          });

          vm.consignaTarea = '';
          getConsignas(vm.consigna.nombre);
        }

      }

      function removeItem(consignaKey, tareaKey) {
        // var client = vm.client.clienteNombre;
        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + consignaKey + '/' + tareaKey).remove();
      }

      function deleteConsigna(consignaKey) {
        alertService.verifyConfirm('Estas seguro de eliminar esta consigna?', '').then(function () {

          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + consignaKey).remove();
          vm.consigna = {};
          vm.isEditConsigna = false;
          getConsignas();

          vm.modalConsigna.dismiss();
        })


      }

      function deleteAllConsignas(clienteName) {
        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre).remove();
        getConsignas();
      }

      function clearConsignas() {

        vm.consignasArray = {};
        vm.isAddConsigna = false;
        vm.view = 'general';

      }

      function errorConsignaUndeclaredClientName() {
        growl.error('Tiene que asignar un nombre al servicio antes de crear Consignas', vm.config)
      }

      function openModalAddResponsible() {
        vm.modalResponsible = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/addResponsible.modal.html',
          scope: $scope,
          size: 'ar',
          backdrop: 'static'
        });
      }

      function saveResponsible() {
        if (!vm.isEditResponsible) {
          vm.responsible.responsibleId = vm.responsibleId;
          vm.listResponsibles.push(vm.responsible);
          vm.modalResponsible.dismiss();
          vm.responsible = {};
          vm.responsibleId++;
        }
      }

      function removeResponsible(idResponsible) {
        for (var index in vm.listResponsibles) {
          var x = vm.listResponsibles[index].responsibleId;
          if (vm.listResponsibles[index].responsibleId == idResponsible) {
            vm.listResponsibles.splice(index, 1);
            vm.responsibleId--;
            break;
          }
        }
        vm.listResponsibles.splice(responsableId - 1, 1);
      }

      function editResponsible(responsibleId) {
        for (var index in vm.listResponsibles) {
          if (vm.listResponsibles[index].responsibleId == responsibleId) {
            vm.responsible = {
              'responsibleName': vm.listResponsibles[index].responsibleName,
              'responsiblePhone': vm.listResponsibles[index].responsiblePhone,
              'responsibleColony': vm.listResponsibles[index].responsibleColony,
              'responsibleStreet': vm.listResponsibles[index].responsibleStreet,
              'responsibleEmail': vm.listResponsibles[index].responsibleEmail,
              'responsibleId': vm.listResponsibles[index].responsibleId
            };
          }
        }
      }

      function updateResponsible(responsibleId) {
        for (var index in vm.listResponsibles) {
          if (vm.listResponsibles[index].responsibleId == responsibleId) {
            vm.listResponsibles.splice(index, 1, vm.responsible);
          }
        }
        vm.modalResponsible.dismiss();
        vm.isEditResponsible = false;
      }

      function getResponsibles(clientName) {
        // vm.responsibleId = 1;
        vm.listResponsibles = [];
        firebase.database().ref('Argus/Clientes/' + clientName + '/clienteResponsables')
          .on('value', function (snapshot) {
            vm.listaResponsables = snapshot.val();
            for (var responsible in vm.listaResponsables) {
              var arrayDomicilio = vm.listaResponsables[responsible].responsableDomicilio.split(",");
              vm.listResponsibles.push({
                'responsibleName': vm.listaResponsables[responsible].responsableNombre,
                'responsiblePhone': vm.listaResponsables[responsible].responsableTelefono,
                'responsibleColony': arrayDomicilio[0],
                'responsibleStreet': arrayDomicilio[1],
                'responsibleEmail': vm.listaResponsables[responsible].responsableCorreo,
                'responsibleId': vm.responsibleId
              });
              vm.responsibleId++;
            }
          });
      }

      function daysSelected(addOrDeleteDay, day) {
        if (addOrDeleteDay) {
          vm.listDaysSchedule.push(day);
        }
        else {
          for (var index in vm.listDaysSchedule) {
            if (vm.listDaysSchedule[index] == day) {
              vm.listDaysSchedule.splice(index, 1);
            }
          }
        }
      }

      function getSchedule(clientName) {
        vm.listDaysSchedule = [];
        vm.saturday = false;
        vm.thusday = false;
        vm.wednesday = false;
        vm.thursday = false;
        vm.friday = false;
        vm.monday = false;
        vm.sunday = false;
        firebase.database().ref('Argus/Clientes/' + clientName + '/clienteHorario')
          .on('value', function (snapshot) {
            var horario = snapshot.val();
            if (horario.diasLaborados.lunes) {
              vm.listDaysSchedule.push('lunes');
              vm.monday = true;
            }
            if (horario.diasLaborados.martes) {
              vm.listDaysSchedule.push('martes');
              vm.thusday = true;
            }
            if (horario.diasLaborados.miercoles) {
              vm.listDaysSchedule.push('miercoles');
              vm.wednesday = true;
            }
            if (horario.diasLaborados.jueves) {
              vm.listDaysSchedule.push('jueves');
              vm.thursday = true;
            }
            if (horario.diasLaborados.viernes) {
              vm.listDaysSchedule.push('viernes');
              vm.friday = true;
            }
            if (horario.diasLaborados.sabado) {
              vm.listDaysSchedule.push('sabado');
              vm.saturday = true;
            }
            if (horario.diasLaborados.domingo) {
              vm.listDaysSchedule.push('domingo');
              vm.sunday = true;
            }
            var timeOpeningh1 = horario.primerHorario.horaApertura.split(":");
            var timeClosingh1 = horario.primerHorario.horaCierre.split(":");
            vm.openingTimeh1 = timeOpeningh1[0] + ":" + timeOpeningh1[1];
            vm.closingTimeh1 = timeClosingh1[0] + ":" + timeClosingh1[1];

            var timeOpeningh2 = horario.segundoHorario.horaApertura.split(":");
            var timeClosingh2 = horario.segundoHorario.horaCierre.split(":");
            vm.openingTimeh2 = timeOpeningh2[0] + ":" + timeOpeningh2[1];
            vm.closingTimeh2 = timeClosingh2[0] + ":" + timeClosingh2[1];

            var timeOpeningh3 = horario.tercerHorario.horaApertura.split(":");
            var timeClosingh3 = horario.tercerHorario.horaCierre.split(":");
            vm.openingTimeh3 = timeOpeningh3[0] + ":" + timeOpeningh3[1];
            vm.closingTimeh3 = timeClosingh3[0] + ":" + timeClosingh3[1];


          });
      }

      function clearSchedule() {
        vm.listDaysSchedule = [];
        vm.openingTimeh1 = "00:00";
        vm.closingTimeh1 = "00:00";
        vm.openingTimeh2 = "00:00";
        vm.closingTimeh2 = "00:00";
        vm.openingTimeh3 = "00:00";
        vm.closingTimeh3 = "00:00";
        vm.saturday = false;
        vm.thusday = false;
        vm.wednesday = false;
        vm.thursday = false;
        vm.friday = false;
        vm.monday = false;
        vm.sunday = false;
      }

      function moveGuardService(guard, service, guardKey) {

        var servicioAnterior = '';

        //Al servicio que vamos enviarlo le asignamos el guardia
        firebase.database().ref('Argus/Clientes/' + document.getElementById(guardKey).value + '/clienteGuardias/').child(guardKey).set({
          usuarioKey: guardKey,
          usuarioNombre: guard.usuarioNombre
        });

        //Obtenemos el servicio actual del guardia
        firebase.database().ref('Argus/guardias/' + guardKey + '/usuarioClienteAsignado')
          .once('value', function (dataSnapshot) {
            servicioAnterior = dataSnapshot.val();
          });

        //Al guardia le asignamos el nuevo servicio
        var update = {};
        update['Argus/guardias/' + guardKey + '/usuarioClienteAsignado'] = document.getElementById(guardKey).value;
        update['Argus/guardias/' + guardKey + '/usuarioDisponible'] = false;
        firebase.database().ref().update(update);

        //Eliminamos al guardia del cliente anterior si es que el guardia ya tenia un cliente anterior
        if (servicioAnterior != null) {
          firebase.database().ref('Argus/Clientes/' + servicioAnterior + '/clienteGuardias/' + guardKey).remove();
        }
      }

      function getServices(zonaID, inputKey) {
        var zona = document.getElementById(zonaID).value;

        if (zona != -1) {
          vm.serviceToSelect[inputKey] = {};
          for (service in vm.zonas[zona]['zonaClientes']) {

            vm.serviceToSelect[inputKey][service] = {
              'clienteNombre': service
            };

          }
        }

      }

      function agregarHorario() {
        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/Horarios').push(vm.horario);
        cerrarHorario();
      }

      function editarHorario() {
        var updates = {};
        updates['Argus/Clientes/' + vm.client.clienteNombre + '/Horarios/'+vm.keyHorario] = {
          desdeHora: vm.horario.desdeHora,
          hastaHora: vm.horario.hastaHora,
          dias: vm.horario.dias
        };
        firebase.database().ref().update(updates);
        cerrarHorario();
      }

      function borrarHorarios() {
        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/Horarios').remove();
      }

      function cerrarHorario() {
        vm.horario = {};
        vm.modalNewHoraqrio.dismiss();
      }

      function borrarHorario(keyHorario) {
        firebase.database().ref('Argus/Clientes/'+ vm.client.clienteNombre + '/Horarios/' + keyHorario).remove();
      }

    }
  ]);
