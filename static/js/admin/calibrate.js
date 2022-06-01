axios.defaults.withCredentials = true;
function onRefresh() {
    if($.cookie("deviceStatus") === undefined) {
        $("#activateSuccessBox").css("display", "none");
        $("#activateSuccessBox2").css("display", "none");
        $("#activateFailedBox").css("display", "");
        $("#activateFailedBox2").css("display", "");
        $("#designatedUUID").val("");
        
    }else {
        $("#activateSuccessBox").css("display", "");
        $("#activateSuccessBox2").css("display", "");
        $("#activateFailedBox").css("display", "none");
        $("#activateFailedBox2").css("display", "none");
        $("#designatedUUID").val($.cookie("deviceID"));
    }
}
onRefresh();

$("#startCalibBtn").click(function() {
    $("#calibrateGuide").css("display", "");
    $("#calibrateNotStartInfo").css("display", "none");
    $("#calibrateFinishInfo").css("display", "none");
    $("#startCalibBtn").attr("disabled", true);
    $("#delCloudCalibBtn").attr("disabled", true);
    $("#stopCalibBtn").attr("disabled", false);
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
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
        }).then(async function (response) {
            ticket = response.data; //get ticket
            finished = false
            fatalErrorFlag = false;
            notFinFlag = false;
            while(!finished && !fatalErrorFlag) { //calibration
                await axios({ //get pending info
                    baseURL: 'http://119.51.227.115:8081',
                    url: "/calibration/pending",
                    method: "GET",
                    headers: {"Authorization": ticket},
                }).then(async function(response) {
                    dataList = JSON.parse(JSON.stringify(response.data));
                    if(dataList.length > 0) {
                        for(var idx in dataList) {
                            data = dataList[idx];
                            await axios({ //initialize calibration
                                baseURL: 'http://119.51.227.115:8081',
                                url: "/calibration/" + data["name"],
                                method: "POST",
                                headers: {"Authorization": ticket},
                            }).then(response => {
                                console.log("Initialize " + data["name"] + " successfully.");
                            }).catch(function (error) {
                                if(error["response"]["status"] == 409) {
                                    notFinFlag = true;
                                    fatalErrorFlag = true;
                                    alert("Exception while initializing new calibration data recording (Previous calibration is not finished)");
                                }else if(error["response"]["status"] == 400) {
                                    fatalErrorFlag = true;
                                    alert("Exception while initializing new calibration data recording (Invalid motion name)");
                                }else {
                                    fatalErrorFlag = true;
                                    alert("Exception while initializing new calibration data recording (Unknown Error)");
                                }
                            });
                            if(fatalErrorFlag) {
                                return;
                            }
                            $("#motionWrapper").text(data["display"]);
                            $("#timeWrapper").text(data["duration"] + " s");
                            $("#guideWrapper").text(data["desc"]);
                            duration = parseInt(data["duration"]);
                            while(duration > 0) {
                                await sleep(1000);
                                duration = duration - 1;
                                $("#timeWrapper").text(duration + " s");
                            }
                            $("#timeWrapper").text("Pending");
                            await sleep(2000); //waiting
                        }
                    }else {
                        finished = true;
                    }
                }).catch(function() {
                    alert("Exception while calibrating info");
                });
            }
            console.log("Data collecting finished");
            if(!fatalErrorFlag) {
                 //get calibration data from local
                await axios({
                    baseURL: 'http://119.51.227.115:8081',
                    url: "/calibration",
                    method: "GET",
                    headers: {
                        "Authorization": ticket,
                    },
                    responseType: 'blob',
                }).then(async function(response) {
                    signature = response.headers['signature'];
                    calibData = new Blob([response.data], { type: 'application/x-tar+gzip' });
                    var formData = new FormData();
                    formData.append("calibration" , calibData);

                    await axios({ //send local calibration data to cloud
                        baseURL: 'https://cloud.tanghaotian.icu:8000',
                        url: "/api/device/" + $.cookie("deviceID") + "/calibration",
                        method: "PUT",
                        headers: {
                            "Authorization": ticket, 
                            "Signature": signature,
                            'content-type': 'multipart/form-data',
                        },
                        data: formData
                    }).then(async function (response) { 
                        await axios({//delete local calibration data
                            baseURL: 'http://119.51.227.115:8081',
                            url: "/calibration",
                            method: "DELETE",
                            headers: {"Authorization": ticket},
                        }).then(response => {
                            alert("Calibration finished successfully.");
                            $("#calibrateGuide").css("display", "none");
                            $("#calibrateFinishInfo").css("display", "");
                            $("#delCloudCalibBtn").attr("disabled", false);
                            $("#stopCalibBtn").attr("disabled", true);
                            $("#startCalibBtn").attr("disabled", false);
                        }).catch(function(error) {
                            fatalErrorFlag = true;
                            alert("Exception while deleting local calibration data");
                        });
                    }).catch(function(error) {
                        fatalErrorFlag = true;
                        alert("Exception while uploading local calibration data to cloud");
                    });
                }).catch(function(error) {
                    fatalErrorFlag = true;
                    alert("Exception while getting calibration data from device");
                })
            }
            if(fatalErrorFlag) {
                if(notFinFlag) { //previous calibration is not finished
                    alert("Previous Calibration is not Finished. Please wait.");
                    $("#calibrateGuide").css("display", "none");
                    $("#calibrateNotStartInfo").css("display", "");
                    $("#calibrateFinishInfo").css("display", "none");
                    $("#delCloudCalibBtn").attr("disabled", false);
                    $("#stopCalibBtn").attr("disabled", true);
                    $("#startCalibBtn").attr("disabled", false);
                }else {
                    alert("Fatal error")
                    $("#calibrateGuide").css("display", "none");
                    $("#calibrateFinishInfo").css("display", "");
                    $("#delCloudCalibBtn").attr("disabled", false);
                    $("#stopCalibBtn").attr("disabled", true);
                    $("#startCalibBtn").attr("disabled", false);
                }
            }
        }).catch(function() {
            alert("Exception while getting ticket");
        });
    }).catch(function() {
        alert("Exception while getting timestamp");
    });
});

$("#stopCalibBtn").click(function() {
    location.reload();
});

$("#delCloudCalibBtn").click(function() {
    if($("#designatedUUID").val() == "") {
        alert("Must Designate UUID First");
        return;
    }
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
            ticket = response.data; //get ticket
            axios({ //delete local calibration data
                baseURL: 'https://cloud.tanghaotian.icu:8000',
                url: "/api/device/" + $("#designatedUUID").val() + "/calibration",
                method: "DELETE",
                headers: {
                    "Authorization": ticket, 
                },
            }).then(response => { 
                alert("Clear Cloud Calibration Data Successfully");
            }).catch(function() {
                alert("Exception while clearing cloud calibration data");
            });
        }).catch(function() {
            alert("Exception while getting ticket");
        });
    }).catch(function() {
        alert("Exception while getting timestamp");
    });
});


$("#uuidSwitchBtn").click(function () {
    if($("#uuidSwitchBtn").text() == "Lock") { 
        $("#designatedUUID").attr("disabled", true); //unlock
        $("#uuidSwitchBtn").text("Unlock");

        if($("#designatedUUID").val() != "") {
            $("#activateSuccessBox").css("display", "");
            $("#activateSuccessBox2").css("display", "");
            $("#activateFailedBox").css("display", "none");
            $("#activateFailedBox2").css("display", "none");
        }
    }else { // == "Unlock"
        $("#designatedUUID").attr("disabled", false); //lock
        $("#uuidSwitchBtn").text("Lock");

        $("#activateSuccessBox").css("display", "none");
        $("#activateSuccessBox2").css("display", "none");
        $("#activateFailedBox").css("display", "");
        $("#activateFailedBox2").css("display", "");
        $("#uploadCloudBaseBtn").attr("disabled", true);
        $("#uploadDeviceAlgoBtn").attr("disabled", true);
    }
});

$("#downloadCalibDataBtn").click(function() {
    if($("#designatedUUID").val() == "") {
        alert("Must Designate UUID First");
        return;
    }
    axios({
        baseURL: 'https://cloud.tanghaotian.icu:8000',
        url: '/api/device/' + $("#designatedUUID").val() +'/calibration',
        method: "GET",
        responseType: 'blob'
    }).then(response => {
        console.log(response);
        let blob = new Blob([response.data], {type: 'application/x-tar+gzip'});
        const elink = document.createElement('a')
        let timestamp = new Date().getTime();
        let fileName= `CalibData${timestamp}.tar.gz`
        elink.target = "hrefTemplate";
        elink.download = fileName;
        elink.href = URL.createObjectURL(blob)
        elink.click()
    }).catch(function(error) {
        alert("Exception while downloading calibration data from cloud");
    });
});

$("#uploadCalibDataBtn").click(function() {
    if($("#designatedUUID").val() == "") {
        alert("Must Designate UUID First");
        return;
    }
    extName = $("#calibDataInput").val().split(".")[1];
    if(extName != "tar" && extName != "gz") {
        alert("Wrong File Format");
        return;
    }
    
    var reader = new FileReader();
    var file = $("#calibDataInput")[0].files[0];
    reader.readAsDataURL(file);
    var formData = new FormData();
    formData.append("calibration" , file);

    axios({
        baseURL: 'https://cloud.tanghaotian.icu:8000',
        url: '/api/device/' + $("#designatedUUID").val() +'/calibration',
        method: "PUT",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then(response => {
        alert("Calibration data uploaded to cloud successfully");
    }).catch(function() {
        alert("Exception while uploading calibration data to cloud");
    });
});
$("#calibDataInput").on("change", function() {
    console.log($("#calibDataInput").val());
    if($("#calibDataInput").val() != "") {
        var filePathArr = $("#calibDataInput").val().split("\\")
        $("#calibDataInputName").text(filePathArr[filePathArr.length-1]);
    }else {
        $("#calibDataInputName").text("None");
    }
});