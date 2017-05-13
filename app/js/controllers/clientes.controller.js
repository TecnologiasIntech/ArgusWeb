/**
 * Created by Toshiba on 20/02/2017.
 */
argus
  .controller('clienteCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl', '$location', '$timeout', 'focusService',
    function ($scope, $rootScope, alertService, $uibModal, growl, $location, $timeout, focusService) {

      //public var
      var vm = this;
      vm.searchInCustomers = '';
      vm.searchInGuards = '';
      vm.customers = {};
      vm.guards = {};
      vm.client = {};
      vm.customersAvailable=[];
      vm.client.clienteDisponible = true;
      vm.isEdit = false;
      vm.guardsToClient = [];
      vm.view = 'general';
      vm.config = {};
      vm.isLoading = false;
      vm.saveGuardias=[];
      vm.saveClientes=[];
      vm.guardiasClienteEliminado = {};
      vm.consignasArray = {};
      vm.isAddConsigna = false;
      vm.consigna = {};
      vm.consigna.items = {};
      vm.isEditConsigna = false;


      //public functions
      vm.openModal = openModal;
      vm.editClient = editClient;
      vm.deleteClient = deleteClient;
      vm.registerClient = registerClient;
      vm.addOrDeleteItemInAssignment = addOrDeleteItemInAssignment;
      vm.verifyChecked = verifyChecked;
      vm.updateClient = updateClient;
      vm.editClientCancel = editClientCancel;
      vm.addConsigna = addConsigna;
      vm.removeItem = removeItem;
      // vm.getTareas = getTareas;
      vm.addItemToConsigna = addItemToConsigna;
      vm.openModalToAsignTitleToConsigna = openModalToAsignTitleToConsigna;
      vm.deleteConsigna = deleteConsigna;
      vm.clearConsignas = clearConsignas;
      vm.verifyClientName = verifyClientName;
      vm.errorConsignaUndeclaredClientName = errorConsignaUndeclaredClientName;
      vm.deleteAllConsignas = deleteAllConsignas;

      //private functions
      function activate() {

        vm.isLoading = true;
        firebase.database().ref('Argus/Clientes')
          .on('value', function (snapshot) {
            vm.customers = snapshot.val();
            vm.isLoading = false;
            $rootScope.$apply();
          });

        firebase.database().ref('Argus/guardias')
          .on('value', function (snapshot) {
            vm.guards = snapshot.val();
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

      function getConsignas( consignaName ) {

        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + consignaName)
          .on('value', function (snapshot) {

            vm.consigna.items = snapshot.val();

           $rootScope.$apply();

          })

      }

      function getConsignasNames( consignaName ) {

        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre)
          .on('value', function (snapshot) {

            vm.consignasArray = snapshot.val();

           $rootScope.$apply();

          })

      }

      function editClient(client, clientName) {
        vm.isEdit = true;
        vm.client = client;
        for(var guard in vm.client.clienteGuardias){
          vm.saveGuardias.push(guard);
          vm.guardsToClient.push({
            usuarioNombre : vm.client.clienteGuardias[guard].usuarioNombre,
            usuarioKey : vm.client.clienteGuardias[guard].usuarioKey
          });
          firebase.database().ref('Argus/guardias/'+ vm.client.clienteGuardias[guard].usuarioKey).update({
            usuarioDisponible: true
          });
        }

        // Obtener las consignas de este cliente
        getConsignasNames( clientName );

        // Obtener los responsables del cliente
        getResponsibles( clientName );


        vm.openModal();
      }

      function editClientCancel(){
        for(var guard in vm.saveGuardias){
          firebase.database().ref('Argus/guardias/'+ vm.saveGuardias[guard]).update({
            usuarioDisponible: false
          });
        }
        vm.saveGuardias=[];
      }

      function deleteClient(client) {

        vm.guardiasClienteEliminado = {};

        firebase.database().ref('Argus/Clientes/' + client.clienteNombre).child('clienteGuardias')
          .on('value', function(snapshot){
            vm.guardiasClienteEliminado = snapshot.val();
          });

        alertService.confirm('Eliminar cliente', '¿Estas seguro de que desea eliminar este cliente?').then(function () {

          for (var guardia in vm.guardiasClienteEliminado) {
            firebase.database().ref('Argus/guardias/' + guardia).update({
              'usuarioDisponible': true
            });
            firebase.database().ref('Argus/guardias/' + guardia).child('usuarioClienteAsignado').remove();
          }

          if(client.clienteZonaAsignada){
            firebase.database().ref('Argus/Zonas/' + client.clienteZonaAsignada + '/zonaClientes/' + client.clienteNombre).remove();
          }

          growl.error('Cliente Eliminado!', vm.config);

          firebase.database().ref('Argus/Clientes/' + client.clienteNombre).remove();
        });


      }

      function registerClient() {

        if (vm.listResponsibles.length == -1) {
          growl.error('¡Debe agregar a un responsable del servicio como minimo!', vm.config);
        }
        else {
          vm.client.clienteDisponible = true;
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre).set(vm.client);

          for(var i = 0; i < vm.guardsToClient.length; i++){
            // Asignar los guardias al cliente
            firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias/' + vm.guardsToClient[i].usuarioKey).set({
              usuarioNombre: vm.guardsToClient[i].usuarioNombre,
              usuarioKey: vm.guardsToClient[i].usuarioKey
            });

            // Agregar referencia del cliente en el guardia
            var updates = {};
            updates['Argus/guardias/' + vm.guardsToClient[i].usuarioKey + '/usuarioClienteAsignado'] = vm.client.clienteNombre;
            updates['Argus/guardias/'+ vm.guardsToClient[i].usuarioKey+'/usuarioDisponible']= false;
            firebase.database().ref().update(updates);

          }

          // Agregar responsables a cliente
          var domicilio = ""; //variable auxiliar para concatenar los campos del domicilio
          for (var responsible in vm.listResponsibles) {
            domicilio = vm.listResponsibles[responsible].responsibleColony + " " + vm.listResponsibles[responsible].responsibleStreet;
            firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteResponsables').push({
              responsableNombre: vm.listResponsibles[responsible].responsibleName,
              responsableTelefono:vm.listResponsibles[responsible].responsiblePhone,
              responsableDomicilio: domicilio,
              responsableCorreo: vm.listResponsibles[responsible].responsibleEmail
            });
          }

          //Agregar horario
          for (var index in vm.listDaysSchedule) {
            // firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteHorario/diasLaborados').push({
            //   ''
            // });
          }
          vm.client = {};
          vm.client.clienteDisponible = true;
          vm.guardsToClient = [];
          vm.listResponsibles = [];
          vm.listDaysSchedule =[];
          vm.responsibleId = 1;
          growl.success('Cliente Agregado!', vm.config);
          vm.modal.dismiss();
        }
      }

      function addOrDeleteItemInAssignment(guard, guardKey) {
        //noinspection JSDuplicatedDeclaration
        var guardObj = guard;
        var guardIndex = _.findIndex(vm.guardsToClient, {'usuarioNombre' : guardObj.usuarioNombre});

        if(guardIndex == -1){
          vm.guardsToClient.push({
            usuarioNombre: guardObj.usuarioNombre,
            // usuarioTurno: guardObj.usuarioTurno,
            usuarioKey: guardKey
          })
        }else{
          vm.guardsToClient.splice(guardIndex, 1);0
        }
      }

      function verifyChecked(guard) {
        var checked;

        checked =_.findIndex(vm.guardsToClient, {'usuarioNombre' : guard});

        return checked;
      }

      function updateClient() {

        if (vm.listResponsibles < 1) {
          growl.error('¡Debe agregar a un responsable del servicio como minimo!', vm.config);
        }
        else {
          for (var guardia in vm.saveGuardias) {
            firebase.database().ref('Argus/guardias/'+ vm.saveGuardias[guardia]).child('usuarioClienteAsignado').remove();
          }
          vm.saveGuardias=[];
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre).update({
            clienteNumeroGuardias: vm.client.clienteNumeroGuardias,
            clienteDomicilio: vm.client.clienteDomicilio
          });

          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias').remove();

          for(var i = 0; i < vm.guardsToClient.length; i++){
            firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias/' +  vm.guardsToClient[i].usuarioKey).set({
              usuarioNombre: vm.guardsToClient[i].usuarioNombre,
              usuarioKey: vm.guardsToClient[i].usuarioKey
            });

            // Agregar referencia del cliente en el guardia
            var updates = {};
            updates['Argus/guardias/' + vm.guardsToClient[i].usuarioKey + '/usuarioClienteAsignado'] = vm.client.clienteNombre;
            updates['Argus/guardias/'+ vm.guardsToClient[i].usuarioKey+'/usuarioDisponible']= false;
            firebase.database().ref().update(updates);

          }
          // Agregar responsables actualizados a cliente
          var domicilio = ""; //variable auxiliar para concatenar los campos del domicilio
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteResponsables').remove();
          for (var responsible in vm.listResponsibles) {
            domicilio = vm.listResponsibles[responsible].responsibleColony + " " + vm.listResponsibles[responsible].responsibleStreet;
            firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteResponsables').push({
              responsableNombre: vm.listResponsibles[responsible].responsibleName,
              responsableTelefono:vm.listResponsibles[responsible].responsiblePhone,
              responsableDomicilio: domicilio,
              responsableCorreo: vm.listResponsibles[responsible].responsibleEmail
            });
          }

          vm.client = {};
          vm.client.clienteDisponible = true;
          vm.guardsToClient = [];
          vm.listResponsibles = [];
          vm.isEdit = false;
          vm.view = 'general';
          growl.info('Cliente Actualizado!', vm.config);
          vm.modal.dismiss();
        }
      }

      function addConsigna( titleConsigna ) {

        if( !titleConsigna ){
          growl.error('No puedes agregar una consigna vacía', vm.config);
        }else{

          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + titleConsigna)
            .once('value', function (snapshot) {

              var existConsigna = snapshot.val();
              if( !existConsigna ){
                vm.isAddConsigna = true;

                firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + titleConsigna).set({
                  prueba:{
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

      function verifyClientName( consignaName ) {

        if( !vm.client.clienteNombre ){
          vm.view = 'general';
          growl.error('Tiene que asignar un nombre al Servicio antes de crear consignas', vm.config)
        }else{
          // vm.view = 'consignas'
          vm.openModalToAsignTitleToConsigna();
          vm.consigna.nombre = consignaName;
          getConsignas( consignaName )
        }

      }

      function addItemToConsigna( consignaTarea ) {

        // Añade la nueva tarea
        if( !consignaTarea ){
          growl.error('No puedes agregar una tarea vacía', vm.config);
        } else if( !vm.consigna.nombre ){
          growl.error('No puedes agregar una tarea a una consigna sin nombre', vm.config);
        } else {

          // Elimina la tarea de prueba
          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + vm.consigna.nombre + '/prueba').remove();

          // Agregamos la tarea a la consigna
          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + vm.consigna.nombre).push({
            consignaNombre: consignaTarea
          });

          vm.consignaTarea = '';
          getConsignas( vm.consigna.nombre );
        }

      }

      function removeItem( consignaKey, tareaKey ) {
        // var client = vm.client.clienteNombre;
        firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + consignaKey + '/' + tareaKey).remove();
      }

      function deleteConsigna( consignaKey ) {

        alertService.verifyConfirm('Estas seguro de eliminar esta consigna?', '').then(function () {

          firebase.database().ref('Argus/Consigna/' + vm.client.clienteNombre + '/' + consignaKey).remove();
          vm.consigna = {};
          vm.isEditConsigna = false;
          getConsignas();

          vm.modalConsigna.dismiss();
        })



      }

      function deleteAllConsignas( clienteName ) {
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

      vm.openModalAddResponsible = openModalAddResponsible;
      function openModalAddResponsible(){
        vm.modalResponsible = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/addResponsible.modal.html',
          scope: $scope,
          size: 'ar',
          backdrop: 'static'
        });
      }

      vm.saveResponsible = saveResponsible;
      vm.listResponsibles = [];
      vm.responsibleId = 1;
      function saveResponsible(){
        if (!vm.isEditResponsible) {
          vm.responsible.responsibleId = vm.responsibleId;
          vm.listResponsibles.push(vm.responsible);
          vm.modalResponsible.dismiss();
          vm.responsible = "";
          vm.responsibleId++;
        }
      }

      vm.removeResponsible = removeResponsible;
      function removeResponsible( idResponsible){
        for (var index in vm.listResponsibles) {
          var x = vm.listResponsibles[index].responsibleId;
          if (vm.listResponsibles[index].responsibleId == idResponsible) {
            vm.listResponsibles.splice(index, 1);
            break;
          }
        }
        vm.listResponsibles.splice(responsableId-1, 1);
      }

      vm.editResponsible = editResponsible;
      vm.isEditResponsible;
      function editResponsible(responsibleName) {
        for (var index in vm.listResponsibles) {
          if (vm.listResponsibles[index].responsibleName == responsibleName) {
            vm.responsible = {
              'responsibleName' : vm.listResponsibles[index].responsibleName,
              'responsiblePhone' : vm.listResponsibles[index].responsiblePhone,
              'responsibleColony' : vm.listResponsibles[index].responsibleColony,
              'responsibleStreet' : vm.listResponsibles[index].responsibleStreet,
              'responsibleEmail' : vm.listResponsibles[index].responsibleEmail,
              'responsibleId' :  vm.listResponsibles[index].responsibleId
            };
          }
        }
      }

      vm.updateResponsible = updateResponsible;
      function updateResponsible( responsibleId ) {
        for (var index in vm.listResponsibles) {
          if (vm.listResponsibles[index].responsibleId == responsibleId) {
            vm.listResponsibles.splice(index, 1, vm.responsible);
          }
        }
        vm.modalResponsible.dismiss();
        vm.isEditResponsible = false;
      }

      function getResponsibles( clientName ) {
        vm.listResponsibles = [];
        firebase.database().ref('Argus/Clientes/'+ clientName +'/clienteResponsables')
         .on('value', function(snapshot){
           vm.listaResponsables = snapshot.val();
           for (var responsible in vm.listaResponsables) {
             var arrayDomicilio = vm.listaResponsables[responsible].responsableDomicilio.split(",");
             vm.listResponsibles.push({
               'responsibleName' : vm.listaResponsables[responsible].responsableNombre,
               'responsiblePhone' : vm.listaResponsables[responsible].responsableTelefono,
               'responsibleColony' : arrayDomicilio[0],
               'responsibleStreet' : arrayDomicilio[1],
               'responsibleEmail' : vm.listaResponsables[responsible].responsableCorreo,
               'responsibleId' :  vm.responsibleId
             });
             vm.responsibleId++;
           }
         });
      }

      vm.daysSelected = daysSelected;
      vm.listDaysSchedule = [];
      function daysSelected( addOrDeleteDay, day ){
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
    }
  ]);
