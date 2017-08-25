argus
  .factory('dateService', function () {
    var days = [];
    days[0] = 'Domingo';
    days[1] = 'Lunes';
    days[2] = 'Martes';
    days[3] = 'Miercoles';
    days[4] = 'Jueves';
    days[5] = 'Viernes';
    days[6] = 'Sabado';

    var letterOfDay = [];
    letterOfDay[0] = 'D';
    letterOfDay[1] = 'L';
    letterOfDay[2] = 'M';
    letterOfDay[3] = 'M';
    letterOfDay[4] = 'J';
    letterOfDay[5] = 'V';
    letterOfDay[6] = 'S';

    var months = [];
    months[0] = {month: "Enero"};
    months[1] = {month: "Febrero"};
    months[2] = {month: "Marzo"};
    months[3] = {month: "Abril"};
    months[4] = {month: "Mayo"};
    months[5] = {month: "Junio"};
    months[6] = {month: "Julio"};
    months[7] = {month: "Agosto"};
    months[8] = {month: "Septiembre"};
    months[9] = {month: "Octubre"};
    months[10] = {month: "Noviembre"};
    months[11] = {month: "Diciembre"};

    return {
      getDayOfWeekAsNumber: function (date) {
        var month = date.substr(4, 2);
        var day = date.substr(6, 2);
        var year = date.substr(0, 4);

        var dt = new Date(month + ' ' + day + ', ' + year + ' 12:00:00');

        return dt.getUTCDay();
      },

      getDayOfWeek: function (year, month, day) {
        var dt = new Date(month + ' ' + day + ', ' + year + ' 12:00:00');

        return days[dt.getUTCDay()];
      },

      getDayOfWeekWithDateInNumbersTogether: function (date) {
        date = date.toString();
        var month = date.substr(4, 2);
        var day = date.substr(6, 2);
        var year = date.substr(0, 4);

        var dt = new Date(month + ' ' + day + ', ' + year + ' 12:00:00');

        return letterOfDay[dt.getUTCDay()];
      },

      getDateFormatWithDiagonals: function (date) {
        return date.substr(0, 4) + '/' + date.substr(4, 2) + '/' + date.substr(6, 2);
      },

      getDateFormatWithOnlyNumbers: function (date) {
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var day = ("0" + (date.getUTCDate())).slice(-2);
        var year = date.getUTCFullYear();
        return (year + '' + month + '' + day);
      }


    }
  });
