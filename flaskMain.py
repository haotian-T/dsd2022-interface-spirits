from fileinput import filename
from flask import Flask, render_template, make_response, send_from_directory, send_file, session, redirect, url_for, request
from constant import PASSWORD, USER_NAME
from loginRelated import loginRelatedApp
import os
from urllib.parse import quote

app = Flask(__name__)
app.register_blueprint(loginRelatedApp, url_prefix="/")
app.secret_key = 'mytestsecret_key'
app.jinja_env.variable_start_string = '[['
app.jinja_env.variable_end_string = ']]'


@app.route('/')
def asdf():
    return redirect(url_for("userRoute"))

@app.route('/user')
def userRoute():
    return redirect(url_for("userDeviceRoute"))


@app.route('/user/device')
def userDeviceRoute():
    return render_template("device.html")


@app.route("/user/model")
def userModelRoute():
    return render_template("model.html")


@app.route("/user/calibrate")
def userCalibrateRoute():
    return render_template("calibrate.html")


@app.route("/user/help")
def helpRoute():
    return render_template("help.html")


@app.route("/admin")
def adminRoute():
    return redirect(url_for("loginRelatedApp.login"))


@app.route("/admin/device")
def adminDeviceRoute():
    return render_template("admin/device.html")
    # if USER_NAME in session:  # already logged in
    #     return render_template("admin/device.html")
    # else:  # not logged in yet
    #     return redirect(url_for('loginRelatedApp.login'))


@app.route("/admin/model")
def adminModelRoute():
    return render_template("admin/model.html")
    # if USER_NAME in session:
    #     return render_template("admin/model.html")
    # else:
    #     return redirect(url_for('loginRelatedApp.login'))


@app.route("/admin/calibrate")
def adminCalibRoute():
    return render_template("admin/calibrate.html")
    # if USER_NAME in session:
    #     return render_template("admin/calibrate.html")
    # else:
    #     return redirect(url_for('loginRelatedApp.login'))


@app.route("/calibration")
def fileTest():
    filename = "C:\\sundries\\Download\\calibration.tar.gz"
    file = open(filename, "rb").read()
    response = make_response(file)
    utf_filename = quote(filename.encode("utf-8"))
    response.headers["Content-Disposition"] = "attachment;filename*=utf-8''{}".format(utf_filename)
    response.headers["Content-Type"] = "application/octet-stream; charset=UTF-8"
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)
