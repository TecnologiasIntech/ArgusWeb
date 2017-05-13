/**
 * Created by Legible on 5/12/2017.
 */
argus
  .filter('formatoFecha', function() {
    return function(value) {

      var months = new Array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");

      var anio = value.substring( 0, 4 );
      var mesNumero = value.substring( 4, 6 );
      var dia = value.substring( 6, 8 );

      var mes = months[ mesNumero - 1 ];

      return dia + ' de ' + mes + ' del ' + anio;
    }
  });
