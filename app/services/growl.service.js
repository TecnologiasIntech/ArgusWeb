/**
 * Created by Toshiba on 21/02/2017.
 */
argus

  .service('growlService', function () {
    var growlService = {};
    growlService.growl =function (message, type, align, from) {
      $.growl({
        message: message
      }, {
        element: 'body',
        type: type,
        allow_dismiss: true,
        placement: {
          from: from,
          align: align
        },
        offset: {
          x: 20,
          y: 85
        },
        spacing: 10,
        z_index: 1031,
        delay: 2500,
        timer: 1000,
        url_target: '_blank',
        mouse_over: false,
        animate: {
          enter: animIn,
          exit: animOut
        }
      })
    }
    return growlService;
  });
