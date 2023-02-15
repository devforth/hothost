#!/bin/bash
version=1.2.28
docker build . -t devforth/hothost-web:$version
docker push devforth/hothost-web:$version

docker build . -t devforth/hothost-web
docker push devforth/hothost-web