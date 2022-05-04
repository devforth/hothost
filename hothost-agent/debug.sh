docker run -it \
  --env HOTHOST_SERVER_BASE=http://127.0.0.1:8007 \
  --env HOTHOST_AGENT_SECRET=123 \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/os-release:/host/etc/os-release:ro \
  -v /etc/hostname:/host/etc/hostname:ro \
  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  $(docker build -q .) bash getinfo.sh