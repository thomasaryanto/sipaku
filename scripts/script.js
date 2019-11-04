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

    console.log(uname);
    console.log(kode);
    console.log(userData);
    
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
