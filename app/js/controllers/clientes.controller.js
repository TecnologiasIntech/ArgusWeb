/**
 * Created by Toshiba on 20/02/2017.
 */
argus
  .controller('clienteCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl',
    function ($scope, $rootScope, alertService, $uibModal, growl) {

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

      //public functions
      vm.openModal = openModal;
      vm.editClient = editClient;
      vm.deleteClient = deleteClient;
      vm.registerClient = registerClient;
      vm.addOrDeleteItemInAssignment = addOrDeleteItemInAssignment;
      vm.verifyChecked = verifyChecked;
      vm.updateClient = updateClient;
      vm.editClientCancel = editClientCancel;

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



      function editClient(client) {
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
        alertService.confirm('Eliminar cliente', '¿Estas seguro de que desea eliminar este cliente?').then(function () {
          firebase.database().ref('Argus/Clientes/' + client.clienteNombre).remove();
          firebase.database().ref('Argus/Zonas/' + client.clienteZonaAsignada + '/zonaClientes/' + client.clienteNombre).remove();
          growl.error('Cliente Eliminado!', vm.config);
        });

        firebase.database().ref('Argus/Clientes/' + client.clienteNombre).child('clienteGuardias')
        .on('value', function(snapshot){
          vm.guardiasClienteEliminado = snapshot.val();
        });
        for (var guardia in vm.guardiasClienteEliminado) {
          firebase.database().ref('Argus/guardias/' + guardia).update({
            'usuarioDisponible': true
          });
          firebase.database().ref('Argus/guardias/' + guardia).child('usuarioClienteAsignado').remove();
        }
      }

      function registerClient() {

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
        vm.client = {};
        vm.client.clienteDisponible = true;
        vm.guardsToClient = [];
        growl.success('Cliente Agregado!', vm.config);
        vm.modal.dismiss();
      }

      function addOrDeleteItemInAssignment(guard, guardKey) {
        //noinspection JSDuplicatedDeclaration
        var guardObj = guard;
        var guardIndex = _.findIndex(vm.guardsToClient, {'usuarioNombre' : guardObj.usuarioNombre});

        if(guardIndex == -1){
          vm.guardsToClient.push({
            usuarioNombre: guardObj.usuarioNombre,
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
        vm.client = {};
        vm.client.clienteDisponible = true;
        vm.guardsToClient = [];
        vm.isEdit = false;
        vm.view = 'general';
        growl.info('Cliente Actualizado!', vm.config);
        vm.modal.dismiss();
      }
    }
  ]);
