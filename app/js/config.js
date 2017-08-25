argus
  .config(function ($stateProvider, $urlRouterProvider) {
    //Con urlRouteProvider declaras la ruta por defecto del ui-view o
    //te redigige aqui cuando escriben una ruta invalida
    //$urlRouterProvider.otherwise("/pages/home/home-vistos");
    $urlRouterProvider.otherwise("/supervisores");

    //En cada state declaras las diferentes rutas con sus vistas correspondientes, tambien
    //puedes declarar sus controladores, por ejemplo "controller: 'CtrlPrueba as vm' "
    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'loginCtrl as vm'
      })

      .state('supervisores', {
        url: '/supervisores',
        templateUrl: 'views/supervisores.html',
        controller: 'supervisorCtrl as vm'
      })

      .state('guardias', {
        url: '/guardias',
        templateUrl: 'views/guardias.html',
        controller: 'guardiaCtrl as vm'
      })

      .state('clientes', {
        url: '/clientes',
        templateUrl: 'views/clientes.html',
        controller: 'clienteCtrl as vm'
      })

      .state('preNomina', {
        url: '/preNomina',
        templateUrl: 'views/preNomina.html',
        controller: 'preNominaCtrl as vm'
      })

      .state('zonas', {
        url: '/zonas',
        templateUrl: 'views/zonas.html',
        controller: 'zonaCtrl as vm'
      })

      .state('bitacoras', {
        url: '/bitacoras',
        templateUrl: 'views/bitacoras.html',
        controller: 'bitacoraCtrl as vm'
      })

      .state('notificaciones',{
        url: '/notificaciones',
        templateUrl: 'views/notificaciones.html',
        controller: 'notificacionCtrl as vm'
      })

      .state('incidentes',{
        url: '/incidentes',
        templateUrl: 'views/incidentes.html',
        controller: 'incidentesCtrl as vm'
      })

      .state('nomina',{
        url: '/nomina',
        templateUrl: 'views/nomina.html',
        controller: 'nominaCtrl as vm'
      })

      .state('bitacoraRegistro',{
        url: '/bitacoraRegistro',
        templateUrl: 'views/bitacoraRegistro.html',
        controller: 'bitacoraRegistroCtrl as vm'
      })

      .state('pages', {
        url: '/pages',
        templateUrl: 'views/common.html'
      })

      .state('pages.home', {
        url: '/home',
        templateUrl: 'views/home.html'
      })
      //-------------------------------

      .state('pages.listview', {
        url: '/listview',
        templateUrl: 'views/list-view.html'
      })

      .state('pages.messages', {
        url: '/messages',
        templateUrl: 'views/messages.html'
      })

      .state('pages.contacts', {
        url: '/contacts',
        templateUrl: 'views/contacts.html'
      })

      .state('pages.wall', {
        url: '/wall',
        templateUrl: 'views/wall.html'
      })


    //Produccion
    var config = {
      apiKey: "AIzaSyC0yuNCG-G00bF80ecXmio8Fg5lgrCoDZI",
      authDomain: "argusseguridad-41e35.firebaseapp.com",
      databaseURL: "https://argusseguridad-41e35.firebaseio.com",
      storageBucket: "argusseguridad-41e35.appspot.com",
      messagingSenderId: "792155953924"
    };

    //Pruebas
    // var config = {
    //   apiKey: "AIzaSyD8Qa_VcmY7VleJDvJBkTyCVYdKyZRXt7M",
    //   authDomain: "argus-zona-de-pruebas.firebaseapp.com",
    //   databaseURL: "https://argus-zona-de-pruebas.firebaseio.com",
    //   projectId: "argus-zona-de-pruebas",
    //   storageBucket: "",
    //   messagingSenderId: "124997949648"
    // };
    firebase.initializeApp(config);
  });

argus.config(['growlProvider', function (growlProvider) {
  growlProvider.globalTimeToLive(5000);
  growlProvider.globalPosition('bottom-right');
}]);
