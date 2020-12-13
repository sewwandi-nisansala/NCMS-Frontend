// Load UI components

/**
 * Menu arrangement
 */
$(function () {
    let role = Cookies.get('role');

    if (role == 0){
        var file = 'inc/html/user.html';
        $('[data-include]').load(file);
    }else if (role == 1) {
        var file = 'inc/html/moh.html';
        $('[data-include]').load(file);
    }else if (role == 2) {
        var file = 'inc/html/doctor.html';
        $('[data-include]').load(file);
    }
});


toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}