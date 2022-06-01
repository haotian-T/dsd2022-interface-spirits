function getModelList() {
    try {
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
                    url: "/api/models",
                    method: "GET",
                    headers: {"Authorization": ticket},
                }).then(function (response) {
                    data = response.data;
                    isFirst = true;
                    for (var key in data) {
                        if (isFirst) {
                            if(data[key]["desc"] == " ") {
                                $("#algoIntro").text("No Introduction");
                            }else {
                                $("#algoIntro").text(data[key]["desc"]);
                            }
                            isFirst = false;
                        }
                        $("#algoList").append($('<option value=' + data[key]["name"] + '>' + data[key]["display"] + ' </option>'));
                    }
                })
            }).catch(function(error) {
                alert("Exception while getting ticket");
            });
        }).catch(function(error) {
            alert("Exception while getting timestamp");
        });
    } catch {
        alert("Get Algorithm List Error");
    }
}

$("#algoList").on("change", function (e) {
    var valueSelected = this.value;
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
                url: "/api/models",
                method: "GET",
                headers: {"Authorization": ticket},
            }).then(function (response) {
                data = response.data;
                if(data[valueSelected]["desc"] == " ") {
                    $("#algoIntro").text("No Introduction");
                }else {
                    $("#algoIntro").text(data[valueSelected]["desc"]);
                }
            }).catch(function(error) {
                alert("Exception while getting algorithm list");
            })
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp");
    });
});

function onRefresh() {
    if ($.cookie("deviceStatus") === undefined) {
        $("#activateSuccessBox").css("display", "none");
        $("#activateFailedBox").css("display", "");
        $("#syncBtn").attr("disabled", true);
    } else {
        $("#activateSuccessBox").css("display", "");
        $("#activateFailedBox").css("display", "none");
        $("#syncBtn").attr("disabled", false);
        getModelList();
    }
}

onRefresh();


//cloud
$("#trainBtn").click(function () {
    if (!confirm("Are you sure to start training the model on the cloud? The operation is irreversible.")) {
        return;
    }
    var curSel = $("select option:selected").val();
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
                url: '/api/device/' + $.cookie("deviceID") + "/model/" + curSel,
                method: "POST",
                headers: {"Authorization": ticket},
            }).then(function (response) {
                alert("Training Starts Successfully. Just wait until it finished patiently.");
            }).catch(function(error) {
                if(error["response"]["status"] == 400) {
                    alert("No calibration data available now");
                }else { //404 e.t.c
                    alert("Exception while start trainning.");
                }
            })
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp");
    });
});

$("#downloadBaseAlgoBtn").click(function () {
    var curSel = $("select option:selected").val();
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
                url: '/api/model/' + curSel,
                method: "GET",
                headers: {"Authorization": ticket},
                responseType: 'blob',
            }).then(function (response) {
                let url = window.URL.createObjectURL(new Blob([response.data]));
                let link = document.createElement("a");
                link.style.display = "none";
                link.href = url;
                let timestamp = new Date().getTime();
                link.download = `${timestamp}CloudBase.pt`;
                document.body.appendChild(link);
                link.click();
            }).catch(function(error) {
                alert("Exception while downloading cloud base model");
            })
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp");
    });
});

$("#deleteCloudBtn").click(function () {
    if (!confirm("Are you sure to reset current model on the cloud to the base model? The operation is irreversible.")) {
        return;
    }
    var curSel = $("select option:selected").val();
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
                url: '/api/device/' + $.cookie("deviceID") + "/model/" + curSel,
                method: "DELETE",
                headers: {"Authorization": ticket},
            }).then(function (response) {
                alert("Algorithm " + curSel + " Reset Successfully");
            }).catch(function(error) {
                alert("Exception while resetting cloud model");
            })
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp");
    });
});

$("#delAllDeviceModelBtn").click(function () {
    if (!confirm("Are you sure to delete all model of current device from cloud? The operation is irreversible.")) {
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
            ticket = response.data;
            axios({
                baseURL: 'https://cloud.tanghaotian.icu:8000',
                url: '/api/device/' + $.cookie("deviceID") + "/model",
                method: "DELETE",
                headers: {"Authorization": ticket},
            }).then(function (response) {
                alert("All model of current device deleted from cloud successfully");
            }).catch(function(error) {
                alert("Exception while deleting all model from cloud");
            });
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp");
    });
});

//device
$("#syncBtn").click(function () {
    if (!confirm("Are you sure to start synchronizing device model and cloud model? The operation is irreversible.")) {
        return;
    }
    var curSel = $("select option:selected").val();
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
            axios({ //download current version of algorithm model from cloud
                baseURL: 'https://cloud.tanghaotian.icu:8000',
                url: '/api/device/' + $.cookie("deviceID") + "/model/" + curSel,
                method: "GET",
                headers: {
                    'content-type': 'application/json',
                    "Authorization": ticket
                },
                responseType: 'blob',
            }).then(function (response) {
                signature = response.headers['signature'];
                lastModified = response.headers["last-modified"];
                contentLen = response.headers["content-length"];
                mData = new Blob([response.data]);
                var formData = new FormData();
                formData.append("model", mData);
                axios({ //upload downloaded model to device
                    baseURL: 'http://119.51.227.115:8081',
                    url: '/model/' + curSel,
                    method: "PUT",
                    data: formData,
                    headers: {
                        "Authorization": ticket,
                        "signature": signature,
                        'content-type': 'multipart/form-data',
                    }
                }).then(response => {
                    alert("Synchronize Successfully.\nModel size is " + contentLen + ", last modified on " + lastModified + ".");
                }).catch(function(error) {
                    alert("Exception while uploading model to device");
                });
            }).catch(function(error) {
                alert("Exception while downloading cloud model")
            });
        }).catch(function(error) {
            alert("Exception while getting ticket")
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp")
    });
});

$("#downloadDeviceModelBtn").click(function () {
    var curSel = $("select option:selected").val();
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
                url: '/model',
                method: "GET",
                headers: {"Authorization": ticket},
                responseType: 'blob',
            }).then(function (response) {
                let url = window.URL.createObjectURL(new Blob([response.data]));
                let link = document.createElement("a");
                link.style.display = "none";
                link.href = url;
                let timestamp = new Date().getTime();
                link.download = `${timestamp}Device.pt`;
                document.body.appendChild(link);
                link.click();
            }).catch(function(error) {
                alert("No model on device currently");
            })
        }).catch(function(error) {
            alert("Exception while getting ticket");
        });
    }).catch(function(error) {
        alert("Exception while getting timestamp");
    });
});

$("#delDeviceModelBtn").click(function () {
    if (!confirm("Are you sure to delete model from device? The operation is irreversible.")) {
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
            ticket = response.data;
            axios({
                baseURL: 'http://119.51.227.115:8081',
                url: '/model',
                method: "DELETE",
                headers: {"Authorization": ticket},
            }).then(function (response) {
                alert("Local model deleted from device successfully");
            }).catch(function (error) {
                alert("Unkown Error");
            });
        }).catch(function (error) {
            alert("Exception while getting ticket");
        });
    }).catch(error => {
        alert("Exception while getting timestamp");
    });
});

