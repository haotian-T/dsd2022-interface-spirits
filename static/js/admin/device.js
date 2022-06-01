repeatInterval = 1000;
stopUpdating = false;
axios.defaults.withCredentials = true;
function updateEmail() {
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
                url: '/api/device/' + $("#designatedUUID").val() + "/email",
                method: "GET",
                headers: {"Authorization": ticket},
            }).then(function (response) {
                $("#curEmail").text(response.data["email"]);
                $("#setEmailBtn").attr("disabled", false);
                $("#unbindEmailBtn").attr("disabled", false);
            }).catch(error => {
                if(error["response"]["status"] == 404) {
                    $("#curEmail").text("Null");
                    $("#setEmailBtn").attr("disabled", false);
                    $("#unbindEmailBtn").attr("disabled", false);
                }else {
                    deactivateDevice();
                    alert("Exception while getting email");
                }
            });
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function() {
        alert("Exception while getting timestamp");
    });
}
function activateDevice() {
    function activateDeviceSub() {
        if(!stopUpdating) {
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
        
                        if($.cookie("deviceStatus") == undefined) {
                            $.cookie("deviceStatus", "Connected", {expires: 7});
                            $.cookie("deviceID", data["id"], {expires: 7});
                            $("#designatedUUID").val($.cookie("deviceID"));
                        }
        
                        $("#activateBtn").attr("disabled", true); //lock activation button
                        $("#deactivateBtn").attr("disabled", false);
                        $("#logoffBtn").attr("disabled", false);
        
                        //get email
                        if($("#designatedUUID").val() == data["id"]) { //not manually designate uuid
                            updateEmail();
                        }
                    }).catch(function(error) {
                        deactivateDevice();
                        alert("Exception while getting device info, activation failed");
                    });
                }).catch(function(error) {
                    alert("Exception while getting ticket, activation failed");
                });
            }).catch(error=>{
                alert("Exception while getting timestamp, activation failed");
            });
        }
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
            url: '/api/device/' + $("#designatedUUID").val() + "/email",
            method: "DELETE",
        }).then(function (response) {
            $("#curEmail").text("Null");
            alert("Unbinded email successfully");
        }).catch(response => {
            alert('Unbind email failed');
        })
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
                    url: '/api/device/' + $("#designatedUUID").val() + "/email",
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
                }).catch(error => {
                    alert("Exception while setting email");
                });
            });
        });
    }else {
        $("#emailHint").text("Invalid Email Address");
    }
}
function clearEmailDialog() {
    $("#emailHint").text("");
    $("#setEmailInput").val("");
}