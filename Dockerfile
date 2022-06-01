FROM python:3.7
MAINTAINER DockerTest
WORKDIR /code
COPY requirements.txt /requirements.txt
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --no-cache-dir gunicorn gevent flask

COPY . /code
CMD gunicorn -c gunicorn.conf flaskMain:app
