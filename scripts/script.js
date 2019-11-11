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
    //return "2019-11-12";
    return today;
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
    console.log(hasil);
    $("#hasil").html('<span class="badge badge-primary">'+ tanggal +'</span> <span class="badge badge-info">'+ waktu +'</span> <br><br> ' + hasil);
}

function getData(){
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
                    console.log(data);
                    getHasil(Jumlah_Value, Jumlah_Data);
                },
                error: function(err) {
                    alert("Terjadi kesalahan saat mengambil data udara!");
                }
            });
            
        });
    }
}

setInterval(getData, 10000);
