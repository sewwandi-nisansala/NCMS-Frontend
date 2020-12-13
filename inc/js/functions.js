// Variables

var apiUrl = "http://localhost:8080";
var baseUrl = "http://localhost/spark2frontend"
var fallbackRoute = "dashboard.html";

// Read URL parameters

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

/**
 * -----------------------------------------------------------------------
 * UI Functions
 * -----------------------------------------------------------------------
 */

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
        let printStr = '<div class="alert alert-danger alert-dismissible mt-3 fade show errorMessage" role="alert"><strong>Error!</strong> Operation failed. Please check the errors and retry.<ul>' + errors + '</ul><button type="button" class="close"data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
        $('#title').after(printStr);
    } else {
        toastr.error('Something went wrong!', 'Error');
    }

    if (redirect){
        window.location.replace(fallbackRoute);
    }
}

/**
 * -----------------------------------------------------------------------
 * Authentication & Role Check
 * -----------------------------------------------------------------------
 */

/**
 * Middleware for login check
 */
$(function () {
    let id = Cookies.get('userId');
    let role = Cookies.get('role');

    if (!id || !role){
        Cookies.remove('userId');
        Cookies.remove('role');
        window.location.replace('index.html');
    }
});

/**
 * Middleware for role based access
 */
$(function () {
    let role = Cookies.get('role');
    let path = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
    
    let mohUrls = [
        'users.html',
        'add-user.html',
        'edit-user.html',
        'hospitals.html',
        'add-hospital.html',
        'edit-hospital.html',
        'profile.html',
        'patients.html',
        'edit-patient.html',
        'dashboard-moh.html',
    ];

    let doctorUrls = [
        'profile.html',
        'patients.html',
        'edit-patient.html',
        'dashboard-doctor.html',
    ];

    let patientUrls = [
        'dashboard-patient.html',
        'profile.html',
    ];

    // Patient
    if (role == 0){
        if (jQuery.inArray(path, patientUrls) === -1) {
            window.location.replace('index.html');
        }
    }

    // MoH
    if (role == 1){
        if (jQuery.inArray(path, mohUrls) === -1){
            window.location.replace('index.html');
        }
    }

    // Doctor
    if (role == 2) {
        if (jQuery.inArray(path, doctorUrls) === -1) {
            window.location.replace('index.html');
        }
    }
});

/**
 * -----------------------------------------------------------------------
 * Database Functions
 * -----------------------------------------------------------------------
 */

/**
 * -----------------------------------------------------------------------
 * Dashboard & Stats
 * -----------------------------------------------------------------------
 */

/**
 * Load details of Patient
 * @param {number} id Patient ID
 */
function dashboardPatient() {
    let id = Cookies.get('userId');
    $.ajax({
        type: "GET",
        url: apiUrl + '/patient?id=' + id + '&ref=1',
        dataType: "json",
        success: function (data, status, xhr) {
            let patient = data.data;
            $('#name').val(patient.name);
            $('#email').val(patient.email);
            $('#contact_number').val(patient.contact_number);
            $('#district').val(patient.district);
            $('#geolocation').val(patient.geolocation_x + ',' + patient.geolocation_y);
            $('#serial_no').val((patient.serial_no != null) ? patient.serial_no : 'NA');
            $('#hospital_name').val((patient.hospital_name != null) ? patient.hospital_name : 'NA');
            $('#bed_no').val((patient.bed_no != null) ? patient.bed_no : 'NA');
            $('#register_date').val((patient.register_date != null) ? patient.register_date : 'NA');
            $('#admission_date').val((patient.admission_date != null) ? patient.admission_date : 'NA');
            $('#discharged_date').val((patient.discharged_date != null) ? patient.discharged_date : 'NA');
            let decease_level = 'NA';
            switch (patient.decease_level) {
                case 0:
                    decease_level = 'Not Assessed';
                    break;

                case 1:
                    decease_level = 'Low';
                    break;

                case 2:
                    decease_level = 'Moderate';
                    break;

                case 3:
                    decease_level = 'Critical';
                    break;
            }
            $('#decease_level').val(decease_level);
            switch (patient.status) {
                case 0:
                    $('#status').val('In Queue');
                    break;
                case 1:
                    $('#status').val('Admitted');
                    $('#admission-container').show();
                    $('#hospital-container').show();
                    break;
                case 2:
                    $('#status').val('Discharged');
                    $('#admission-container').show();
                    $('#discharged-container').show();
                    break;
                default:
                    break;
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Load data for stat display
 */
function loadStats(){
    $.ajax({
        type: "GET",
        url: apiUrl + '/stats',
        dataType: "json",
        success: function (data, status, xhr) {

            $('#queue_count').html('In Queue     : ' +(data.data.total_status.label[0] != null ? data.data.total_status.data[0]  : 0));
            $('#discharged_count').html('Discharged   : '+(data.data.total_status.label[2] != null ? data.data.total_status.data[2]  : 0));
            $('#total_count').html('Total Count : ' +(data.data.total_status.label[1] != null ? data.data.total_status.data[1] : 0));
          
            $('#daily_queue_count').html('In Queue     : ' + (data.data.daily_status[0] != null ? data.data.daily_status[0] : 0));
            $('#daily_discharged_count').html('Discharged   : '+ (data.data.daily_status[2] != null ? data.data.daily_status[2] : 0) );
            $('#daily_total_count').html('Total Count : ' + (data.data.daily_status[1] != null ? data.data.daily_status[1] : 0));
            
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * -----------------------------------------------------------------------
 * Hospital CURD Functions & Helper Functions
 * -----------------------------------------------------------------------
 */

/**
 * Load Hospital List
 */
function loadHospitalList() {
    $.ajax({
        type: "GET",
        url: apiUrl + '/lists/hospitals',
        dataType: "json",
        success: function (data, status, xhr) {
            let hospitals = data.data;
            $.each(hospitals, function(key, hospital){
                let printStr = '<tr><td>' + hospital.name + '</td><td>' + hospital.director + '</td><td>' + hospital.geolocation_x + ',' + hospital.geolocation_y + '</td><td>' + hospital.district + '</td><td>' + hospital.patient_count + '</td><td><a href="edit-hospital.html?id=' + hospital.id + '" class="btn btn-outline-primary btn-sm">Edit</a></td></tr>';
                $('#hospitals-list tr:last').after(printStr); 
            });
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Load details of Hospital
 * @param {number} id Hospital ID
 */
function editHospital(id){
    $.ajax({
        type: "GET",
        url: apiUrl + '/hospital?id=' + id,
        dataType: "json",
        success: function (data, status, xhr) {
            let hospital = data.data;
            $('#name').val(hospital.name);
            $('#district').val(hospital.district).change();
            $('#geolocation_x').val(hospital.geolocation_x);
            $('#geolocation_y').val(hospital.geolocation_y);
            $('#doctor').val(hospital.user_id).change();
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Add new hospital
 * @param {form} form Form
 */
function addHospital(form) {
    $.ajax({
        type: "POST",
        url: apiUrl + '/hospital?' + form.serialize(),
        success: function (data, status, xhr) {
            toastr.success('Hospital added successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            toastr.error('Something went wrong! ' + errorMessage, 'Error')
        }
    });
}

/**
 * Update hospital
 * @param {number} id Hospital ID
 * @param {form} form Form
 */
function updateHospital(id, form){
    $.ajax({
        type: "PUT",
        url: apiUrl + '/hospital?id=' + id + '&' + form.serialize(),
        success: function (data, status, xhr) {
            toastr.success('Hospital updated successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            toastr.error('Something went wrong! ' + errorMessage, 'Error')
        }
    });
}

/**
 * 
 * @param {number} id Hospital ID
 */
function deleteHospital(id) {
    $.ajax({
        type: "DELETE",
        url: apiUrl + '/hospital?id=' + id,
        success: function (data, status, xhr) {
            toastr.success('Hospital deleted successfully', 'Delete Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            toastr.error('Something went wrong! ' + errorMessage, 'Error')
        }
    });
}

/**
 * Load doctors to dropdown list
 */
function loadDoctorsToDropdown() {
    $.ajax({
        type: "GET",
        url: apiUrl + '/lists/doctors',
        dataType: "json",
        success: function (data, status, xhr) {
            $.each(data.data, function (key, doctor) {
                $('#doctor').append('<option value=' + doctor.id + '>' + doctor.name + '</option>');
            });
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * -----------------------------------------------------------------------
 * Patient CURD & Helper Functions
 * -----------------------------------------------------------------------
 */

/**
 * Load Patient List
 */
function loadPatientList(hospital, status) {
    $.ajax({
        type: "GET",
        url: apiUrl + '/lists/patients?hospital=' + hospital + '&status=' + status,
        dataType: "json",
        success: function (data, status, xhr) {
            let patients = data.data;
            $("#patients-list > tbody").html("");
            $.each(patients, function (key, patient) {
                let decease_level = 'NA';
                switch (patient.decease_level) {
                    case 0:
                        decease_level = 'Not Assessed';
                        break;
                
                    case 1:
                        decease_level = 'Low';
                        break;

                    case 2:
                        decease_level = 'Moderate';
                        break;

                    case 3:
                        decease_level = 'Critical';
                        break;
                }

                let printStr = '<tr><td>' + patient.name + '</td><td>' + patient.contact_number + '</td><td>' + patient.geolocation_x + ',' + patient.geolocation_y + '</td><td>' + patient.district + '</td><td>' + ((patient.status == 0) ? 'N/A' : decease_level) + '</td><td>' + ((patient.hospital == null) ? 'NA' : patient.hospital) + '</td><td><a href="edit-patient.html?id=' + patient.id + '" class="btn btn-outline-primary btn-sm">Edit</a></td></tr>';
                $('#patients-list > tbody').append(printStr);
            });
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Load details of Patient
 * @param {number} id Patient ID
 */
function editPatient(id) {
    $.ajax({
        type: "GET",
        url: apiUrl + '/patient?id=' + id + '&ref=0',
        dataType: "json",
        success: function (data, status, xhr) {
            let patient = data.data;
            $('#name').val(patient.name);
            $('#email').val(patient.email);
            $('#contact_number').val(patient.contact_number);
            $('#district').val(patient.district);
            $('#geolocation').val(patient.geolocation_x + ',' + patient.geolocation_y);
            $('#serial_no').val((patient.serial_no != null) ? patient.serial_no : 'NA');
            $('#hospital_name').val((patient.hospital_name != null) ? patient.hospital_name : 'NA');
            $('#bed_no').val((patient.bed_no != null) ? patient.bed_no : 'NA');
            $('#register_date').val((patient.register_date != null) ? patient.register_date : 'NA');
            $('#admission_date').val((patient.admission_date != null) ? patient.admission_date : 'NA');
            $('#discharged_date').val((patient.discharged_date != null) ? patient.discharged_date : 'NA');
            $('#decease_level').val(patient.decease_level).change();
            switch (patient.status) {
                case 0:
                    $('#status').val('In Queue');
                    break;
                case 1:
                    $('#status').val('Admitted');
                    $('#admission-container').show();
                    $('#hospital-container').show();
                    $('#save').show();
                    enableDischargeFunction(patient.hospital_id);
                    break;
                case 2:
                    $('#status').val('Discharged');
                    $('#admission-container').show();
                    $('#discharged-container').show();
                    $('#decease_level').prop('disabled', 'disabled');
                    break;
                default:
                    break;
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Update decease level
 * @param {number} id Patient ID
 * @param {form} form Form
 */
function updatePatient(id, form){
    $.ajax({
        type: "PUT",
        url: apiUrl + '/patient?id=' + id + '&' + form.serialize(),
        success: function (data, status, xhr) {
            toastr.success('Patient updated successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Discharge patient
 * @param {number} id Patient ID
 */
function dischargePatient(id) {
    $.ajax({
        type: "DELETE",
        url: apiUrl + '/patient?id=' + id,
        success: function (data, status, xhr) {
            toastr.success('Patient discharged successfully', 'Save Complete');
            window.location.replace("edit-patient.html?id=" + id);
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Enable discharge feature
 * @param {number} id Hospital ID
 */
function enableDischargeFunction(id) {
    $.ajax({
        type: "GET",
        url: apiUrl + '/hospital?id=' + id,
        dataType: "json",
        success: function (data, status, xhr) {
            let hospital = data.data;
            let id = Cookies.get('userId');

            if (hospital.user_id == id) {
                $('#discharge').show();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Load hospital of the doctor
 * @param {number} id User ID
 */
function loadHospitalOfDoctorToDropdown() {
    let id = Cookies.get('userId');
    $.ajax({
        type: "GET",
        url: apiUrl + '/user?id=' + id,
        dataType: "json",
        success: function (data, status, xhr) {
            let user = data.data;
            $('#hospital').append('<option value=' + user.hospital_id + '>My Hospital</option>');
            loadPatientList(user.hospital_id, 1)
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * -----------------------------------------------------------------------
 * User Management CURD & Helper Functions
 * -----------------------------------------------------------------------
 */

/**
 * Load Users List
 */
function loadUsersList() {
    let id = Cookies.get('userId');
    $.ajax({
        type: "GET",
        url: apiUrl + '/lists/users',
        dataType: "json",
        success: function (data, status, xhr) {
            let users = data.data;
            $.each(users, function (key, user) {
                let printStr = '';
                if (id == user.id){
                    printStr = '<tr><td>' + user.name + '</td><td>' + user.email + '</td><td>' + ((user.hospital == null) ? '-' : user.hospital) + '</td><td>' + ((user.role == 1) ? 'MOH' : 'Doctor') + '</td><td><a href="profile.html" class="btn btn-outline-primary btn-sm">View Profile</a></td></tr>';
                }else{
                    printStr = '<tr><td>' + user.name + '</td><td>' + user.email + '</td><td>' + ((user.hospital == null) ? '-' : user.hospital) + '</td><td>' + ((user.role == 1) ? 'MOH' : 'Doctor') + '</td><td><a href="edit-user.html?id=' + user.id + '" class="btn btn-outline-primary btn-sm">Edit</a></td></tr>';
                }
                $('#users-list tr:last').after(printStr);
            });
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Add new user
 * @param {form} form Form
 */
function addUser(form) {
    $.ajax({
        type: "POST",
        url: apiUrl + '/register?' + form.serialize(),
        success: function (data, status, xhr) {
            form.trigger("reset");
            toastr.success('User added successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Load details of User
 * @param {number} id Hospital ID
 */
function editUser(id) {
    $.ajax({
        type: "GET",
        url: apiUrl + '/user?id=' + id,
        dataType: "json",
        success: function (data, status, xhr) {
            let user = data.data;
            $('#name').val(user.name);
            $('#email').val(user.email);
            $('#role').val(user.role).change();
            $('#hospital').val(user.hospital_id).change();
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr, true);
        }
    });
}

/**
 * Update user details
 * @param {number} id User ID
 * @param {form} form Form
 */
function updateUser(id, form) {
    $.ajax({
        type: "POST",
        url: apiUrl + '/user?id=' + id + '&' + form.serialize(),
        success: function (data, status, xhr) {
            toastr.success('User updated successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}


/**
 * Delete user
 * @param {number} id User ID
 */
function deleteUser(id) {
    $.ajax({
        type: "DELETE",
        url: apiUrl + '/user?id=' + id,
        success: function (data, status, xhr) {
            toastr.success('User deleted successfully', 'Delete Complete');
            window.location.replace("users.html");
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}


/**
 * Load hospitals to dropdown list
 */
function loadHospitalsToDropdown() {
    $.ajax({
        type: "GET",
        url: apiUrl + '/lists/hospitals',
        dataType: "json",
        success: function (data, status, xhr) {
            $.each(data.data, function (key, hospital) {
                $('#hospital').append('<option value=' + hospital.id + '>' + hospital.name + '</option>');
            });
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * -----------------------------------------------------------------------
 * Profile
 * -----------------------------------------------------------------------
 */

/**
 * Load details of user
 */
function editProfile() {
    let id = Cookies.get('userId');
    $.ajax({
        type: "GET",
        url: apiUrl + '/profile?id=' + id,
        dataType: "json",
        success: function (data, status, xhr) {
            let user = data.data;
            $('#name').val(user.name);
            $('#email').val(user.email);
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr, true);
        }
    });
}

/**
 * Update profile
 * @param {form} form Form
 */
function updateProfile(form) {
    let id = Cookies.get('userId');
    $.ajax({
        type: "POST",
        url: apiUrl + '/profile?id=' + id + '&' + form.serialize(),
        success: function (data, status, xhr) {
            toastr.success('Profile updated successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}

/**
 * Update password
 * @param {number} id User ID
 * @param {form} form Form
 */
function updatePassword(form) {
    let id = Cookies.get('userId');
    $.ajax({
        type: "PUT",
        url: apiUrl + '/profile?id=' + id + '&' + form.serialize(),
        success: function (data, status, xhr) {
            toastr.success('Password updated successfully', 'Save Complete');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            ajaxErrorHandle(jqXhr);
        }
    });
}