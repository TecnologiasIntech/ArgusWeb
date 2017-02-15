/**
 * Created by Toshiba on 28/12/2016.
 */
argus
  .factory('alertService', ['$q', function ($q) {

    return{
      error: function (title, message) {
        swal(title, message, 'error');
      },
      complete: function (title, message) {
        var deferred = $q.defer();
        swal(title, message, 'success').then(function () {
          deferred.resolve();
        })

        return deferred.promise;
      }
    }

  }])
