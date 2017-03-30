/**
 * Created by Toshiba on 23/02/2017.
 */
argus
  .controller('zonaCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl',
    function ($scope, $rootScope, alertService, $uibModal, growl) {

      //public var
      var vm = this;
      vm.zones = {};
      vm.searchInZones = '';
      vm.searchInClients = '';
      vm.zone = {};
      vm.zoneClients = {};
      vm.isEdit = false;
      vm.customers = {};
      vm.customersToZone = [];
      vm.config = {};
      vm.isLoading = false;

      //public functions
      vm.openModal = openModal;
      vm.editZone = editZone;
      vm.deleteZone = deleteZone;
      vm.registerZone = registerZone;
      vm.addOrDeleteItemInAssignment = addOrDeleteItemInAssignment;
      vm.verifyChecked = verifyChecked;
      vm.updateZone = updateZone;

      //private functions
      function activate() {
        vm.isLoading = true;

        // Datos de todos las zonas
        firebase.database().ref('Argus/Zonas')
          .on('value', function (snapshot) {
            vm.zones = snapshot.val();
            vm.isLoading = false;
            $rootScope.$apply();
          });

        firebase.database().ref('Argus/Clientes')
          .on('value', function (snapshot) {
            vm.customers = snapshot.val();
            $rootScope.$apply();
          })


      }
      activate();

      function openModal() {
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/zonas.modal.html',
          scope: $scope,
          size: 'lm',
          backdrop: 'static'
        });
      }

      function editZone(zone) {
        vm.isEdit = true;
        vm.zone = zone;
        for(var client in vm.zone.zonaClientes){
          vm.customersToZone.push({clienteNombre : vm.zone.zonaClientes[client].clienteNombre});
        }
        vm.openModal();
      }

      function deleteZone(zone) {
        alertService.confirm('Eliminar zona', '¿Estas seguro de que desea eliminar esta zona?').then(function () {
          firebase.database().ref('Argus/Zonas/' + zone.zonaNombre).remove();
          growl.error('Zona Eliminada!', vm.config);
        });
      }

      function registerZone() {
        firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre).set({
          zonaNombre: vm.zone.zonaNombre
        });

        for(var i = 0; i < vm.customersToZone.length; i++){
          firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre + '/zonaClientes').push({
            clienteNombre: vm.customersToZone[i].clienteNombre
          });
        }
        vm.customersToZone = [];
        growl.success('Zona Agregada!', vm.config);
        vm.modal.dismiss();
      }

      function addOrDeleteItemInAssignment(cliente) {
        //noinspection JSDuplicatedDeclaration
        var customer = cliente;
        var clientIndex = _.findIndex(vm.customersToZone, {'clienteNombre' : customer.clienteNombre});

        if(clientIndex == -1){
          vm.customersToZone.push({
            clienteNombre: customer.clienteNombre
          })
        }else{
          vm.customersToZone.splice(clientIndex, 1);
        }
      }

      function verifyChecked(client) {
        var checked;

        checked =_.findIndex(vm.customersToZone, {'clienteNombre' : client});

        return checked;
      }

      function updateZone() {
        firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre + '/zonaClientes').remove();

        for(var i = 0; i < vm.customersToZone.length; i++){
          firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre + '/zonaClientes').push({
            clienteNombre: vm.customersToZone[i].clienteNombre
          });
        }
        growl.info('Zona Actualizada!', vm.config);
        vm.modal.dismiss();
      }
    }
  ]);
