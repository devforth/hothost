#!/bin/bash
version=1.2.44
docker buildx create --use
docker buildx build --platform=linux/amd64,linux/arm64 \
  --tag "devforth/hothost-web:$version" \
  --tag "devforth/hothost-web:latest" \
  --push .
