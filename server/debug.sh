
docker rm -f hothost-web-debug
docker run -d --name=hothost-web-debug \
  -v ~/hothostdata:/var/lib/hothost/data/  \
  --env HOTHOST_WEB_ADMIN_USERNAME=admin  \
  --env HOTHOST_WEB_ADMIN_PASSWORD=123456  \
  --restart=always  \
  --env HOTHOST_WEB_PORT=8009  \
  -p 8009:8009  \
  $(docker build -q .)

xdg-open http://dockerized-hothost.localhost:8009
