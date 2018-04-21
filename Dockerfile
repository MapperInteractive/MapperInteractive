FROM ubuntu:16.04

RUN apt-get -qq -y update && \
    apt-get install -qq -y python3 python3-pip && \
    pip3 install -U pip && pip3 install Flask==0.12.2

COPY . /srv/
WORKDIR /srv/
RUN pip3 install -e .
WORKDIR /srv/local

EXPOSE 5000
CMD ["python3", "run.py"]
