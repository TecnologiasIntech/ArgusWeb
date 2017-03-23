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
      vm.client.clienteDisponible = true;
      vm.isEdit = false;
      vm.guardsToClient = [];
      vm.view = 'general';
      vm.config = {};
      vm.isLoading = false;

      //public functions
      vm.openModal = openModal;
      vm.editClient = editClient;
      vm.deleteClient = deleteClient;
      vm.registerClient = registerClient;
      vm.addOrDeleteItemInAssignment = addOrDeleteItemInAssignment;
      vm.verifyChecked = verifyChecked;
      vm.updateClient = updateClient;

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
          vm.guardsToClient.push({
            usuarioNombre : vm.client.clienteGuardias[guard].usuarioNombre,
            usuarioKey : vm.client.clienteGuardias[guard].usuarioKey
          });
        }
        vm.openModal();
      }

      function deleteClient(client) {
        firebase.database().ref('Argus/Clientes/' + client.clienteNombre).remove();
        growl.error('Cliente Eliminado!', vm.config);
      }

      function registerClient() {
        firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre).set(vm.client);

        for(var i = 0; i < vm.guardsToClient.length; i++){
          firebase.database().ref('Argus/Clientes/' + vm.client.clienteNombre + '/clienteGuardias/' + vm.guardsToClient[i].usuarioKey).set({
            usuarioNombre: vm.guardsToClient[i].usuarioNombre,
            usuarioKey: vm.guardsToClient[i].usuarioKey
          });
        }
        vm.client = {};
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
        }
        vm.client = {};
        vm.guardsToClient = [];
        vm.isEdit = false;
        vm.view = 'general';
        growl.info('Cliente Actualizado!', vm.config);
        vm.modal.dismiss();
      }
    }
  ]);
