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
        });

        return deferred.promise;
      },
      confirm: function (title, message) {
        var deferred = $q.defer();
        swal({
          title: title,
          text: message,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar'
        }).then(function () {
          swal(
            'Eliminado',
            'Ha sido eliminado correctamente',
            'success'
          );
          deferred.resolve();
        });
        return deferred.promise;
      },
      verifyConfirm: function (title, message) {
        var deferred = $q.defer();

        swal({
          title: title,
          text: message,
          type: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar'
        }).then(function () {
          deferred.resolve();
        });

        return deferred.promise;
      },

      confirmOrCancel: function (title, message, textConfirm, textCancel) {
        var deferred = $q.defer();

        swal({
          title: title,
          text: message,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: textConfirm,
          cancelButtonText: textCancel,
          confirmButtonClass: 'btn btn-success',
          cancelButtonClass: 'btn btn-danger',
          buttonsStyling: false
        }).then(function () {
          deferred.resolve(true);
        }, function (dismiss) {
          if (dismiss === 'cancel') {
            deferred.resolve(false);
          }
        })

        return deferred.promise;
      }

    }

  }])
