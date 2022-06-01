repeatInterval = 1000;

function activateDevice() {
    function activateDeviceSub() {
        axios({
            baseURL: 'https://cloud.tanghaotian.icu:8000',
            url: '/api/timestamp',
            method: "GET",
        }).then(function (response) {
            timestamp = response.data;
            axios({
                baseURL: 'http://119.51.227.115:8081',
                url: '/ticket?ts=' + timestamp,
                method: "GET",
            }).then(function (response) {
                ticket = response.data;
                axios({
                    baseURL: 'http://119.51.227.115:8081',
                    url: '/',
                    method: "GET",
                    headers: {"Authorization": ticket},
                }).then(function (response) {
                    data = response.data;
                    $("#activateSuccessBox").css("display", "");
                    $("#activateFailedBox").css("display", "none");
    
                    $("#deviceID").text(data["id"]);
                    $("#deviceStatus").text("Connected");
                    $("#batteryVal").text(data["battery"]);
                    $("#chargingStatus").text(data["charging"]);
                    $("#currentAlgorithm").text(data["algorithm"]["display"]);
                    $("#predictedPose").text(data["prediction"]);
    
                    $.cookie("deviceStatus", "Connected", {expires: 7});
                    $.cookie("deviceID", data["id"], {expires: 7});
    
                    $("#activateBtn").attr("disabled", true); //lock activation button
                    $("#deactivateBtn").attr("disabled", false);
                    $("#logoffBtn").attr("disabled", false);
    
                    //get email
                    axios({
                        baseURL: 'https://cloud.tanghaotian.icu:8000',
                        url: '/api/device/' + $("#deviceID").text() + "/email",
                        method: "GET",
                        headers: {"Authorization": ticket},
                    }).then(function (response) {
                        $("#curEmail").text(response.data["email"]);
                        $("#setEmailBtn").attr("disabled", false);
                        $("#unbindEmailBtn").attr("disabled", false);
                    }).catch(function(error) {
                        if(error["response"]["status"] == 404) {
                            $("#curEmail").text("Null");
                            $("#setEmailBtn").attr("disabled", false);
                            $("#unbindEmailBtn").attr("disabled", false);
                        }else {
                            console.log("Exception while getting email");
                        }
                    });
                }).catch(function(error) {
                    alert("Exception while getting device info, activation failed");
                });
            }).catch(function(error) {
                alert("Exception while getting ticket, activation failed");
            });
        }).catch(error=>{
            alert("Exception while getting timestamp, activation failed");
        });
    } 
    activateDeviceSub();
    setInterval(activateDeviceSub, repeatInterval);
}
function deactivateDevice() {
    $.cookie("deviceStatus", "", {expires: -1});
    $.cookie("deviceID", "", {expires: -1});
    location.reload();
}

function unbindEmail() {
    if(confirm("Are you sure to unbind email?")) {
        axios({
            baseURL: 'https://cloud.tanghaotian.icu:8000',
            url: '/api/timestamp',
            method: "GET",
        }).then(function (response) {
            timestamp = response.data;
            axios({
                baseURL: 'http://119.51.227.115:8081',
                url: '/ticket?ts=' + timestamp,
                method: "GET",
            }).then(function (response) {
                ticket = response.data;
                console.log(ticket);
                axios({
                    baseURL: 'https://cloud.tanghaotian.icu:8000',
                    url: '/api/device/' + $("#deviceID").text() + "/email",
                    method: "DELETE",
                    headers: {
                        "Authorization": ticket
                    },
                }).then(function (response) {
                    $("#curEmail").text("Null");
                    alert("Unbinded email successfully");
                }).catch(response => {
                    alert('Unbind email failed');
                })
            }).catch(function() {
                alert("Exception while getting ticket");
            });
        }).catch(function() {
            alert("Exception while getting timestamp")
        });
    }
}

function validEmail(str) {
    var re = /^([a-z0-9_\.-]+)@([\da-z\.]+)\.([a-z\.]{2,6})$/g;
    return re.test(str) && str.length < 255
}

function setEmail() {
    emailInput = $("#setEmailInput").val();
    if(validEmail(emailInput)) {
        axios({
            baseURL: 'https://cloud.tanghaotian.icu:8000',
            url: '/api/timestamp',
            method: "GET",
        }).then(function (response) {
            timestamp = response.data;
            axios({
                baseURL: 'http://119.51.227.115:8081',
                url: '/ticket?ts=' + timestamp,
                method: "GET",
            }).then(function (response) {
                ticket = response.data;
                axios({
                    baseURL: 'https://cloud.tanghaotian.icu:8000',
                    url: '/api/device/' + $("#deviceID").text() + "/email",
                    method: "POST",
                    headers: {
                        'content-type': 'application/json',
                        "Authorization": ticket
                    },
                    data: {
                        "email": emailInput
                    }
                }).then(function (response) {
                    activateDevice();
                    alert("Set email successfully");
                    $("#closeEmailDialogBtn").trigger("click");
                    clearEmailDialog();
                }).catch(function(error) {
                    console.log(error)
                    alert("Exception while setting email");
                })
            }).catch(function(error) {
                alert("Exception while getting ticket");
            });
        }).catch(function(error) {
            alert("Exception while getting timestamp")
        });
    }else {
        $("#emailHint").text("Invalid Email Address");
    }
}
function clearEmailDialog() {
    $("#emailHint").text("");
    $("#setEmailInput").val("");
}