#!/bin/bash
service elasticsearch start
/usr/Redis/redis-5.0.5/src/redis-server > /dev/null &
mongod --bind_ip_all > /dev/null &

python3.6 /usr/SGRW/src/manage.py makemigrations IGAEapp
python3.6 /usr/SGRW/src/manage.py migrate
python3.6 /usr/SGRW/src/manage.py runserver 0.0.0.0:8000
