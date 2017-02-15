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

    var config = {
      apiKey: "AIzaSyC7ONGr_pbrC8ka-8v5a2-SNRkYP5ATU1k",
      authDomain: "geeb-e2f11.firebaseapp.com",
      databaseURL: "https://geeb-e2f11.firebaseio.com",
      storageBucket: "geeb-e2f11.appspot.com",
      messagingSenderId: "945237774250"
    };
    firebase.initializeApp(config);
  });
