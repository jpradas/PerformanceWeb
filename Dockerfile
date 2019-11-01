FROM debian:stretch

WORKDIR /usr/SGRW

# Update & install packages
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y openjdk-8-jdk wget gnupg make gcc procps build-essential libssl-dev \
	zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl llvm \
	libncurses5-dev  libncursesw5-dev xz-utils tk-dev

# MongoDB
RUN mkdir /usr/Mongo && cd /usr/Mongo && wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - &&  \
	echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.2 main" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list && \
	apt-get update && apt-get install -y mongodb-org && mkdir /data && mkdir /data/db 
	

# Redis service
RUN mkdir /usr/Redis && cd /usr/Redis && wget http://download.redis.io/releases/redis-5.0.5.tar.gz && \
	tar xzf redis-5.0.5.tar.gz && cd redis-5.0.5 && make
	# src/redis-server > /dev/null &

# ElasticSearch
RUN mkdir /usr/Elasticsearch && cd /usr/Elasticsearch && wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add - && \
	apt-get install -y apt-transport-https && echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-7.x.list && \
	apt-get update && apt-get install -y elasticsearch && \
	update-rc.d elasticsearch defaults 95 10

# Install Python 3.6.4
RUN mkdir /usr/Python3.6 && cd /usr/Python3.6 && wget https://www.python.org/ftp/python/3.6.4/Python-3.6.4.tgz && \
	tar xvf Python-3.6.4.tgz && cd Python-3.6.4 && ./configure --enable-optimizations && \
	make -j8 && make altinstall
RUN pip3.6 install --upgrade pip

# Python dependencies
RUN pip install Django sqlparse==0.2.4 djongo channels pymongo channels_redis django_elasticsearch-dsl

# Web files
# COPY . .

# Admin Django
# RUN echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | python3.6 IGAE/manage.py shell --crear una vez rulando el contenedor

# Start bash
COPY start.sh .
RUN chmod +x start.sh

# Django entrypoint
EXPOSE 8000
# Mongo Admin
EXPOSE 27017

ENTRYPOINT ["./start.sh"]
# ENTRYPOINT ["/bin/bash"]

