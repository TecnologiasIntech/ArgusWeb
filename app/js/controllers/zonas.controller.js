/**
 * Created by Toshiba on 23/02/2017.
 */
argus
  .controller('zonaCtrl', ['$scope', '$rootScope', 'alertService', '$uibModal', 'growl','$location', '$timeout',
    function ($scope, $rootScope, alertService, $uibModal, growl, $location, $timeout) {

      //public var
      var vm = this;
      vm.zones = {};
      vm.searchInZones = '';
      vm.searchInClients = '';
      vm.zone = {};
      vm.zoneClients = {};
      vm.isEdit = false;
      vm.customers = {};
      vm.customersAvailable=[];
      vm.customersToZone = [];
      vm.config = {};
      vm.isLoading = false;
      vm.saveClients=[];
      vm.clientesZonaEliminada={};

      //public functions
      vm.openModal = openModal;
      vm.editZone = editZone;
      vm.deleteZone = deleteZone;
      vm.registerZone = registerZone;
      vm.addOrDeleteItemInAssignment = addOrDeleteItemInAssignment;
      vm.verifyChecked = verifyChecked;
      vm.updateZone = updateZone;
      vm.editZoneCancel = editZoneCancel;

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
          });
      }
      activate();

      function openModal() {
        //vm.saveClients=[];
        vm.modal = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/zonas.modal.html',
          scope: $scope,
          size: 'lm',
          backdrop: 'static'
        });
      }

      function editZone(zone) {
        vm.customersToZone = [];
        vm.isEdit = true;
        vm.zone = zone;
        for(var client in vm.zone.zonaClientes){
          vm.customersToZone.push({clienteNombre : vm.zone.zonaClientes[client].clienteNombre});
          vm.saveClients.push(vm.zone.zonaClientes[client].clienteNombre);
          firebase.database().ref('Argus/Clientes/'+ vm.zone.zonaClientes[client].clienteNombre).update({
            clienteDisponible: true
          });
          // firebase.database().ref('Argus/Clientes/'+ vm.zone.zonaClientes[client].clienteNombre + '/clienteZonaAsignada').remove();
        }
        vm.openModal();
      }
      function editZoneCancel(){
        for(var client in vm.saveClients){
          firebase.database().ref('Argus/Clientes/'+ vm.saveClients[client]).update({
            clienteDisponible: false
          });
        }
        vm.saveClients=[];
      }

      function deleteZone(zone) {
        vm.clientesZonaEliminada={};
        alertService.confirm('Eliminar zona', '¿Estas seguro de que desea eliminar esta zona?').then(function () {

          /*Obtenemos los clientes de la zona a eliminar*/
          firebase.database().ref('Argus/Zonas/'+ zone.zonaNombre).child('zonaClientes')
            .on('value', function(snapshot){
              vm.clientesZonaEliminada = snapshot.val();
            });
          /*Ponemos disponibles los clientes de la zona eliminada*/
          for (var custom in vm.clientesZonaEliminada) {
            firebase.database().ref('Argus/Clientes/'+ custom).update({
              'clienteDisponible': true
            });
            /*Eliminamos del cliente el atributo que hacia referencia a su zona*/
            firebase.database().ref('Argus/Clientes/'+ custom).child('clienteZonaAsignada').remove();
          }
          firebase.database().ref('Argus/supervisores')
            .on('value', function(snapshot){
              vm.supervisores = snapshot.val();
              for (var supervisor in vm.supervisores) {
                if (vm.supervisores[supervisor].usuarioZona == zone.zonaNombre) {
                  firebase.database().ref('Argus/supervisores/' + supervisor + '/usuarioZona').remove();
                }
              }
            });

          firebase.database().ref('Argus/Zonas/' + zone.zonaNombre).remove();
          growl.error('Zona Eliminada!', vm.config);
        });

      }

      function registerZone() {

        firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre).set({
          zonaNombre: vm.zone.zonaNombre,
          disponibilidadZona: true
        });

        for(var i = 0; i < vm.customersToZone.length; i++){
          // Agregar el cliente a la zona
          firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre + '/zonaClientes/' + vm.customersToZone[i].clienteNombre).set({
            clienteNombre: vm.customersToZone[i].clienteNombre
          });

          // Agregar referencia de la zona al cliente
          var updates = {};
          updates['Argus/Clientes/' + vm.customersToZone[i].clienteNombre + '/clienteZonaAsignada'] = vm.zone.zonaNombre;
          updates['Argus/Clientes/'+ vm.customersToZone[i].clienteNombre+'/clienteDisponible']=false;
          firebase.database().ref().update(updates);


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
        for (var cliente in vm.saveClients) {
          var x= vm.saveClients[cliente];
          firebase.database().ref('Argus/Clientes/'+ vm.saveClients[cliente] + '/clienteZonaAsignada').remove();
        }
        vm.saveClients=[];
        firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre + '/zonaClientes').remove();

        for(var i = 0; i < vm.customersToZone.length; i++){
          // Asigna todos los clientes a la zona
          firebase.database().ref('Argus/Zonas/' + vm.zone.zonaNombre + '/zonaClientes/' + vm.customersToZone[i].clienteNombre).set({
            clienteNombre: vm.customersToZone[i].clienteNombre
          });



          // Agregar referencia de la zona al cliente
          var updates = {};
          updates['Argus/Clientes/' + vm.customersToZone[i].clienteNombre + '/clienteZonaAsignada'] = vm.zone.zonaNombre;
          updates['Argus/Clientes/'+ vm.customersToZone[i].clienteNombre+'/clienteDisponible'] = false;
          firebase.database().ref().update(updates);


        }
        growl.info('Zona Actualizada!', vm.config);
        vm.modal.dismiss();
      }
    }
  ]);
