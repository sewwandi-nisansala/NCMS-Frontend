var apiUrl = "http://localhost:8080";

/**
 * Load data for stat display
 */
function loadStats() {
    $.ajax({
        type: "GET",
        url: apiUrl + '/stats',
        dataType: "json",
        success: function (data, status, xhr) {
            let chart1 = document.getElementById("districtChart");
            let districtChart = new Chart(chart1, {
                type: 'bar',
                data: {
                    labels: data.data.district.label,
                    datasets: [{
                        data: data.data.district.data,
                        backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745', '#fd00ef'],
                    }],
                },
            });

            let chart2 = document.getElementById("dailyChart");
            let dailyChart = new Chart(chart2, {
                type: 'bar',
                data: {
                    labels: data.data.days.label,
                    datasets: [{
                        label: "Revenue",
                        backgroundColor: "rgba(2,117,216,1)",
                        borderColor: "rgba(2,117,216,1)",
                        data: data.data.days.data,
                    }],
                },
                options: {
                    scales: {
                        xAxes: [{
                            time: {
                                unit: 'month'
                            },
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                maxTicksLimit: 6
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                min: 0,
                                maxTicksLimit: 5
                            },
                            gridLines: {
                                display: true
                            }
                        }],
                    },
                    legend: {
                        display: false
                    }
                }
            });

            let chart3 = document.getElementById("totalStatus");
            let totalStatus = new Chart(chart3, {
                type: 'bar',
                data: {
                    labels: data.data.total_status.label,
                    datasets: [{
                        data: data.data.total_status.data,
                        backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745'],
                    }],
                },
            });

            $('#queue_count').html((data.data.daily_status[0] != null ? data.data.daily_status[0] : 0) + ' In Queue');
            $('#admission_count').html((data.data.daily_status[1] != null ? data.data.daily_status[1] : 0) + ' Daily Admissions');
            $('#discharged_count').html((data.data.daily_status[2] != null ? data.data.daily_status[2] : 0) + ' Discharged');
        },
        error: function (jqXhr, textStatus, errorMessage) {
            
        }
    });
}