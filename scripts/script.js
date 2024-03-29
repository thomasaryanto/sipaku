var userPoolId = 'us-east-1_yZruguFbj'
var clientId = '1kl3k4putbms4hp9fsbqf41h3k'

var poolData = { UserPoolId : userPoolId,
    ClientId : clientId
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function login(){
    var username = $('#username').val();
    var authenticationData = {
        Username: username,
        Password: $('#password').val()
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {
        Username : username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    console.log(cognitoUser)
    cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            var accessToken = result.getAccessToken().getJwtToken();
            console.log("Authentication successful", accessToken)
            window.location = './index.html'
        },

        onFailure: function(err) {
            console.log("failed to authenticate");
            console.log(err.message || JSON.stringify(err));
            alert("Gagal masuk!\nCek kembali username / password kamu.")
        },
    });
}

function daftar(){
    var username = $('#username').val();
    var email = $('#email').val();
    var password = $('#password').val();

    var attributeList = [];

    var dataEmail = {
        Name: 'email',
        Value: email,
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);

    userPool.signUp(username, password, attributeList, null, function(
        err,
        result
    ) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        var cognitoUser = result.user;
        console.log('berhasil daftar username: ' + cognitoUser.getUsername());
        alert("Pendaftaran berhasil! Silahkan verifikasi email kamu.");
        window.location = './konfirmasi.html?uname='+ cognitoUser.getUsername();
    });
}

function konfirmasi(){
    var uname = getParameterByName('uname');
    var kode = $('#kode').val();

    var userData = {
        Username: uname,
        Pool: userPool,
    };
    
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(kode, true, function(err, result) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        console.log('Verifikasi berhasill: ' + result);
        alert("Verifikasi berhasil! Silahkan login.");
        window.location = './masuk.html';
    });
}

function checkLogin(redirectOnRec, redirectOnUnrec){

    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        console.log("user exists")
        if (redirectOnRec) {
            window.location = './index.html';
        } else {
            $("#body").css({'visibility':'visible'});           
        }
    } else {
        if (redirectOnUnrec) {
            window.location = './masuk.html'
        } 
    }
}

function checkAdmin(){

    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser.username != "admin") {
        alert("Access denied!");
        window.location = './index.html';
    }
}

function logOut() {
    
    var cognitoUser = userPool.getCurrentUser();
    console.log(cognitoUser, "signing out...")
    cognitoUser.signOut();
    window.location = './masuk.html';
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getTanggal(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    //return "2019-11-18";
    return today;
}

function getTahun(){
    var today = new Date();
    var yyyy = today.getFullYear();
    
    today = yyyy;
    return 'Kualitas udara tahun '+today;
}

function getWaktu(){
    var d = new Date();
    var jam = d.getHours();
    var menit = d.getMinutes();
    var detik = d.getSeconds();

    time = jam + ':' + menit + ':' + detik;
    return time;
}

function getHasil(value, data){
    var tanggal = getTanggal();
    var waktu = getWaktu();

    var rata2 = Math.round(value / data);
    var hasil;

    if (rata2 >= 0 && rata2 <= 500){
        hasil = '<button type="button" class="btn btn-success">BAIK <span class="badge badge-light">'+ rata2 +'</span></button>';
    }
    else if (rata2 >= 501 && rata2 <= 1000){
        hasil = '<button type="button" class="btn btn-warning">SEDANG <span class="badge badge-light">'+ rata2 +'</span></button>';
    }
    else {
        hasil = '<button type="button" class="btn btn-danger">BURUK <span class="badge badge-light">'+ rata2 +'</span></button>';
    }
    $("#hasil").html('<span class="badge badge-primary">'+ tanggal +'</span> <span class="badge badge-info">'+ waktu +'</span> <br><br> ' + hasil);
    $("#hasil2").html('<span class="badge badge-primary">'+ tanggal +'</span> <span class="badge badge-info">'+ waktu +'</span> <br><br> ');
}

function getHasilPrediksi(value){
    
    var rata2 = Math.round(value);
    var hasil;

    if (rata2 >= 0 && rata2 <= 500){
        hasil = '<button type="button" class="btn btn-success">BAIK <span class="badge badge-light">'+ rata2 +'</span></button>';
    }
    else if (rata2 >= 501 && rata2 <= 1000){
        hasil = '<button type="button" class="btn btn-warning">SEDANG <span class="badge badge-light">'+ rata2 +'</span></button>';
    }
    else {
        hasil = '<button type="button" class="btn btn-danger">BURUK <span class="badge badge-light">'+ rata2 +'</span></button>';
    }
    return hasil;
}

function getUdara(){
    var cognitoUser = userPool.getCurrentUser();
    var tanggal = getTanggal();
    var tahun = getTahun();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session token: ' + session.getIdToken().getJwtToken());
            $.ajax({
                url: "https://5zij6j6dg8.execute-api.us-east-1.amazonaws.com/SIPAKU/getudara",
                method: "POST",
                data: JSON.stringify({"tanggal" : tanggal}),
                crossDomain: true,
                headers: {
                    Authorization: session.getIdToken().getJwtToken()
                },
                success: function(data) {
                    var Waktu = [];
                    var Value = [];
                    var Tanggal = [];

                    var Jumlah_Value = 0;
                    var Jumlah_Data = 0;
        
                    for(var i in data) {
                        Waktu.push(data[i].Waktu);
                        Value.push(data[i].Value);
                        Tanggal.push(data[i].Tanggal);
                        Jumlah_Value = Jumlah_Value + data[i].Value;
                        Jumlah_Data = Jumlah_Data + 1;
                    }
        
                    var chartdata = {
                        labels: Waktu,
                        
                        datasets : [
                        {   
                            label: 'Air Quality',
                            backgroundColor: 'rgba(0, 119, 204, 0.3)',
                            borderColor: 'rgba(200, 200, 200, 0.75)',
                            hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
                            hoverBorderColor: 'rgba(200, 200, 200, 1)',
                            data: Value
                        }]
                    };
        
                    var ctx = $("#canvas");
                    var barGraph = new Chart(ctx, {
                        type: 'line',
                        data: chartdata,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            tooltips: {
                                mode: 'index',
                                intersect: false,
                            },
                            hover: {
                                mode: 'nearest',
                                intersect: true
                            },
                            scales: {
                                xAxes: [{
                                    display: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Time'
                                    }
                                }],
                                yAxes: [{
                                    display: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Air Quality Value'
                                    },
                                    ticks: {
                                        max: 1000,
                                        min: 0,
                                        stepSize: 200
                                    }
                                }]
                            }
                        }
                    });
                    getHasil(Jumlah_Value, Jumlah_Data);
                    $("#tahun").html(tahun)
                },
                error: function(err) {
                    alert("Terjadi kesalahan saat mengambil data udara!");
                }
            });
            
        });
    }
}

function getPrediksi(){
    var cognitoUser = userPool.getCurrentUser();
    var tanggal = getTanggal();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session token: ' + session.getIdToken().getJwtToken());
            $.ajax({
                url: "https://5zij6j6dg8.execute-api.us-east-1.amazonaws.com/SIPAKU/getprediksi",
                method: "POST",
                crossDomain: true,
                headers: {
                    Authorization: session.getIdToken().getJwtToken()
                },
                success: function(data) {
                    var Average = [];
                    var Tanggal = [];

                    console.log(data);
                    
                    if(data != ""){

                        for(var i in data[0].PredictData) {
                            Average.push(Math.round(data[0].PredictData[i].Average));
                            Tanggal.push(data[0].PredictData[i].Tanggal);
                        }
            
                        var chartdata = {
                            labels: Tanggal,
                            
                            datasets : [
                            {   
                                label: 'Prediction Air Quality',
                                backgroundColor: 'rgba(0, 119, 204, 0.3)',
                                borderColor: 'rgba(200, 200, 200, 0.75)',
                                hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
                                hoverBorderColor: 'rgba(200, 200, 200, 1)',
                                data: Average
                            }]
                        };
            
                        var ctx = $("#canvas2");
                        var barGraph = new Chart(ctx, {
                            type: 'line',
                            data: chartdata,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                tooltips: {
                                    mode: 'index',
                                    intersect: false,
                                },
                                hover: {
                                    mode: 'nearest',
                                    intersect: true
                                },
                                scales: {
                                    xAxes: [{
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Date'
                                        }
                                    }],
                                    yAxes: [{
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Average Air Quality'
                                        }
                                    }]
                                }
                            }
                        });

                        var st = JSON.stringify(data[0]['DateCreated']);
                        var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
                        
                        var now = getTanggal();
                        var date_last = new Date(st.replace(pattern,'$3-$2-$1'));
                        var date_now = new Date(now + " 00:00:00");

                        const diffTime = Math.abs(date_now - date_last);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        
                        if(diffDays >= 6){
                            $('#btnPrediksi').prop("disabled", false);
                            $("#btnPrediksi").prop('value', 'MULAI PREDIKSI');
                        }
                        else {
                            $('#btnPrediksi').prop("disabled", true);
                            $("#btnPrediksi").prop('value', 'PREDIKSI SELESAI PADA '+st);
                        }
                    }
                    else {
                        $('#btnPrediksi').prop("disabled", false);
                        $("#btnPrediksi").prop('value', 'MULAI PREDIKSI');
                    }

                },
                error: function(err) {
                    alert("Terjadi kesalahan saat mengambil data prediksi!");
                }
            });
            
        });
    }
}

function mulaiPrediksi(){
    var cognitoUser = userPool.getCurrentUser();
    var tanggal = getTanggal();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session token: ' + session.getIdToken().getJwtToken());
            $.ajax({
                url: "https://5zij6j6dg8.execute-api.us-east-1.amazonaws.com/SIPAKU/mulaiprediksi",
                method: "POST",
                crossDomain: true,
                headers: {
                    Authorization: session.getIdToken().getJwtToken()
                },
                success: function(data) {
                    getPrediksi();
                },

                error: function(err) {
                    alert("Terjadi kesalahan saat mengambil data prediksi!");
                }
            });
            
        });
    }
}

function mulaiModel(){
    var cognitoUser = userPool.getCurrentUser();
    var tanggal = getTanggal();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session token: ' + session.getIdToken().getJwtToken());
            $.ajax({
                url: "https://5zij6j6dg8.execute-api.us-east-1.amazonaws.com/SIPAKU/mulaimodel",
                method: "POST",
                crossDomain: true,
                headers: {
                    Authorization: session.getIdToken().getJwtToken()
                },
                success: function(data) {
                    console.log("MEMPROSES PEMBUATAN MODEL...");
                    mulaiPrediksi();
                },

                error: function(err) {
                    alert("Terjadi kesalahan saat membuat model prediksi!");
                }
            });
            
        });
    }
}


function getPrediksiIndex(){
    var cognitoUser = userPool.getCurrentUser();
    var tanggal = getTanggal();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session token: ' + session.getIdToken().getJwtToken());
            $.ajax({
                url: "https://5zij6j6dg8.execute-api.us-east-1.amazonaws.com/SIPAKU/getprediksi",
                method: "POST",
                crossDomain: true,
                headers: {
                    Authorization: session.getIdToken().getJwtToken()
                },
                success: function(data) {
                    
                    var trHTML = '';
                    for(var i in data[0].PredictData) {
                        var hasilprediksi= getHasilPrediksi(data[0].PredictData[i].Average);
                        trHTML += '<tr><td style="text-align:center">' + data[0].PredictData[i].Tanggal + '</td><td style="text-align:center">' + data[0].PredictData[i].Average + '</td><td style="text-align:center">' + hasilprediksi + '</td></tr>';
                    };
                    $('#records_table').append(trHTML);

                    console.log(data);
                },
                
                error: function(err) {
                    alert("Terjadi kesalahan saat mengambil data prediksi!");
                }
            });
            
        });
    }
}

function getUdaraYear(){
    var cognitoUser = userPool.getCurrentUser();
    var tanggal = getTanggal();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session token: ' + session.getIdToken().getJwtToken());
            $.ajax({
                url: 'https://5zij6j6dg8.execute-api.us-east-1.amazonaws.com/SIPAKU/getudarayear',
                method: "POST",
                crossDomain: true,
                headers: {
                    Authorization: session.getIdToken().getJwtToken()
                },
                success: function(data) {
                    // res = JSON.parse(data);
                    cal_data = JSON.parse(data.body);
         
                    var calendar = new CalHeatMap();
                    calendar.init({
                        data: cal_data,
                        start: new Date(2019, 0),
                        // id : "graph_k",
                        itemSelector: '#cal-heatmap',
                        domain : "month",
                        subDomain : "day",
                        range : 12,
                        cellsize: 15,
                        cellpadding: 3,
                        cellradius: 5,
                        domainGutter: 15,
                        weekStartOnMonday: 0,
                        legend: [400.00, 600.00, 800.00, 1000.00, 1500.00],
                        legendColors: {
                            min: "green",
                            max: "red",
                            empty: "white"
                            // Will use the CSS for the missing keys
                        }
                    });
                    calendar
                } 
            });
            
        });
    }
}

