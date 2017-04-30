/**
 * Created by Carlos Alatorre on 29/04/2017.
 */
argus
  .factory('focusService', ['$q', function ($q) {

    return{
      putFocus: function (id) {
        document.getElementById( id ).focus();
      }
    }
  }]);
