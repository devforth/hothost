#!/bin/bash
version=1.0.2
docker build . -t devforth/hothost-agent:$version
docker push devforth/hothost-agent:$version

docker build . -t devforth/hothost-agent
docker push devforth/hothost-agent