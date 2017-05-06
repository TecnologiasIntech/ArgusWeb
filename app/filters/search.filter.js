argus
  .filter('search', function() {
  return function(input, search) {
    if (!input) return input;
    if (!search) return input;
    var expected = ('' + search).toLowerCase();
    var result = {};
    angular.forEach(input, function(value, key) {
      var actual = ('' + value).toLowerCase();
      if (actual.indexOf(expected) !== -1) {
        result[key] = value;
      }
    });
    return result;
  }
});


argus
  .filter('guardiasAsignados', function() {
    return function(collection) {
      var soloAsignados = {};
      //
      // for(guardia in collection){
      //   for(asignado in asignados){
      //     if(collection[guardia].usuarioNombre == asignados[asignado].usuarioNombre){
      //       console.log(collection[guardia]);
      //       soloAsignados[collection[guardia]]
      //     }
      //   }
      // }

      console.log(collection)

      return soloAsignados;
    }
  });
