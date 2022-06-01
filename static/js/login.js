axios.defaults.withCredentials = true;
function checkLegality() {
    username = document.getElementById("username")
    password = document.getElementById("password")
    errMsgUsername = document.getElementById("errMsgUsername")
    errMsgPassword = document.getElementById("errMsgPassword")

    if(username.value == "" || password.value == "") {
        if(username.value == "") {
            errMsgUsername.innerHTML = "Please input your username."
        }else {
            errMsgUsername = ""
        }
        if(password.value == "") {
            errMsgPassword.innerHTML = "Please input your password."
        }else {
            errMsgPassword.innerHTML = ""
        }
        return false;
    }else {
        errMsgUsername.innerHTML = ""
        errMsgPassword.innerHTML = ""
        return true;
    }
}

$("#loginBtn").click(function() {
    if(!checkLegality()) {
        return false;
    }
    var username = $("#username").val();
    var password = $("#password").val();
    axios({
        baseURL: 'https://cloud.tanghaotian.icu:8000',
        url: '/api/session',
        method: "POST",
        data: {
            "username": username,
            "password": password
        }
    }).then(function (response) {
        // location.reload();
        window.location.href="/admin/device";
    }).catch(error => {
        alert('Wrong user name or password');
    })
    return true;
});