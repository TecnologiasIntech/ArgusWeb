argus
  .factory('objetService', function () {


    return {

      existInObject: function (object, item) {
        var exist = false;

        for(i in object){
          if (i == item){
            exist = true;
            break;
          }
        }
        return exist;
      },

      getObjectLength: function (object) {
        return Object.keys(object).length;
      }

    }
  });
