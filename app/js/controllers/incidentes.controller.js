
argus.controller('incidentesCtrl', ['$scope', '$rootScope', 'growl', '$uibModal', 'alertService',
      function($scope, $rootScope, growl, $uibModal, alertService){

        //public vars
        var vm = this;
        vm.incident = {};
        vm.config = {};
        vm.incidents = [];
        vm.view = 'general';
        vm.incident.incidenteGravedad = 'Media';
        vm.incident.incidenteTipo = '';

        //public functions

        vm.openModal = openModal;
        vm.registerIncident = registerIncident;
        vm.deleteincident = deleteincident;
        vm.updateIncident = updateIncident;
        vm.editIncident = editIncident;


        //private functions
        function activate() {
          vm.isLoading = true;
          firebase.database().ref('Argus/IncidenteTipo')
            .on('value', function (snapshot) {
              vm.incidents = snapshot.val();
              vm.isLoading = false;
              $rootScope.$apply();
            });
        }
        activate();

        function openModal() {
          vm.modal = $uibModal.open({
            animation: true,
            templateUrl: 'views/modals/incidentes.modal.html',
            scope: $scope,
            size: 'li',
            backdrop: 'static'
          });
        }

        function registerIncident(incidenteTipo, incidenteGravedad){
             firebase.database().ref('Argus/IncidenteTipo/').push({
                 incidenteTipo: incidenteTipo,
                 incidenteGravedad: incidenteGravedad
             });
          vm.incident = {};
          vm.incidents = [];
          vm.incident.incidenteGravedad = 'Media';
          growl.success('Incidente Agregado!', vm.config);
          activate();
          vm.modal.dismiss();
        }

        function deleteincident(key){
          alertService.confirm('Eliminar incidente', '¿Estas seguro de que desea eliminar este incidente?').then(function () {
            vm.incidentNombre = key;
            firebase.database().ref('Argus/IncidenteTipo').child(vm.incidentNombre).remove();
            growl.error('Incidente Eliminado!', vm.config);
          });
        }

        function editIncident(incident, key) {
          vm.isEdit = true;
          vm.incidentNombre = key;
          vm.incident = incident;
          vm.openModal();
          console.log(incident);
        }

        function updateIncident() {
          firebase.database().ref('Argus/IncidenteTipo/' + vm.incidentNombre + '/').update({
            incidenteTipo: vm.incident.incidenteTipo,
            incidenteGravedad: vm.incident.incidenteGravedad
          });
          vm.incident = [];
          vm.incident.incidenteGravedad = 'Media';
          vm.incidentNombre='';
          vm.isEdit = false;
          vm.modal.dismiss();
          growl.info('Zona Actualizada!', vm.config);
        }


    //fin del bloque
      }
]);
