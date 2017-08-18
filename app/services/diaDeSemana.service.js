argus
  .factory('dayOfWeekService', function () {
    var days = [];
    days[0] = 'Domingo';
    days[1] = 'Lunes';
    days[2] = 'Martes';
    days[3] = 'Miercoles';
    days[4] = 'Jueves';
    days[5] = 'Viernes';
    days[6] = 'Sabado';

    return {
      getDayOfWeek: function (year, month, day) {
        var dt = new Date(month + ' ' + day + ', ' + year + ' 12:00:00');

        return days[dt.getUTCDay()];
      }
    }
  });
