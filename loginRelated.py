from flask import Flask, render_template, make_response, send_from_directory, session, redirect, url_for, request, \
    Blueprint
from constant import PASSWORD, USER_NAME, EMAIL_ADDR, VERIFICATION_CODE
from account import loginSuccess, registerSuccess

loginRelatedApp = Blueprint('loginRelatedApp', __name__, template_folder="templates")


# login page and processing
@loginRelatedApp.route('/login', methods=["GET", "POST"])
def login():
    if USER_NAME in session:  # already logged in
        return redirect(url_for('adminRoute'))
    return render_template('login.html')


@loginRelatedApp.route('/admin/login', methods=["GET", "POST"])
def adminlogin():
    if USER_NAME in session:  # already logged in
        return redirect(url_for('adminRoute'))
    return render_template('login.html')


# @loginRelatedApp.route("/api/session", methods=["POST", "DELETE"])
# def ses():
#     if request.method == 'POST':
#         if loginSuccess(request.json[USER_NAME], request.json[PASSWORD]):
#             session[USER_NAME] = request.json[USER_NAME]
#             return "success", 200
#         else:
#             return "fail", 400
#     if request.method == "DELETE":
#         session.pop(USER_NAME, None)
#         return "succ", 200
