var apiUrl = "http://localhost:8080";
var fallbackRoute = "index.html";

/**
 * Display Errors in Page
 * @param {Array} jqXhr Ajax Response
 * @param {boolean} redirect Redirect After Error
 */

function ajaxErrorHandle(jqXhr, redirect = false) {
    if (jqXhr.responseJSON != null) {
        let errors = '';
        $.each(jqXhr.responseJSON.errors, function (key, error) {
            errors = errors + '<li>' + error + '</li>';
        });
        let printStr = '<div class="alert alert-danger alert-dismissible mt-3 mx-3 fade show errorMessage" role="alert"><strong>Error!</strong> Operation failed. Please check the errors and retry.<ul>' + errors + '</ul><button type="button" class="close"data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
        $('#title').after(printStr);
    } else {
        toastr.error('Something went wrong!', 'Error');
    }

    if (redirect) {
        window.location.replace(fallbackRoute);
    }
}

/**
 * -----------------------------------------------------------------------
 * Authentication
 * -----------------------------------------------------------------------
 */

/**
 * Login to Ncms
 * @param {form} form Form
 */
function loginToNcms(form) {
    $.ajax({
        type: "POST",
        url: apiUrl + '/login?' + form.serialize(),
        success: function (data, status, xhr) {
            let userId = data.data.id;
            let role = data.data.role;

            Cookies.set('userId', userId);
            Cookies.set('role', role);

            switch (role) {
                case 0:
                    window.location.replace('dashboard-patient.html');
                    break;
            
                case 1:
                    window.location.replace('dashboard-moh.html');
                    break;

                case 2:
                    window.location.replace('dashboard-doctor.html');
                    break;

                default:
                    window.location.replace(fallbackRoute);
                    break;
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}


/**
 * Logout active user
 */
function logout() {
    Cookies.remove('userId');
    Cookies.remove('role');
    window.location.replace(fallbackRoute);
}


/**
 * Register to Ncms
 * @param {form} form Form
 */
function registerToNcms(form) {
    $.ajax({
        type: "POST",
        url: apiUrl + '/register?' + form.serialize(),
        success: function (data, status, xhr) {
            let userId = data.data.userId;
            let role = data.data.role;

            Cookies.set('userId', userId);
            Cookies.set('role', role);

            switch (role) {
                case 0:
                    window.location.replace('dashboard-patient.html');
                    break;

                case 1:
                    window.location.replace('dashboard-moh.html');
                    break;

                case 2:
                    window.location.replace('dashboard-doctor.html');
                    break;

                default:
                    window.location.replace(fallbackRoute);
                    break;
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}