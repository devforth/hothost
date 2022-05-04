# hothost



docker run -d --name=hothost \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/os-release:/host/etc/os-release:ro \
  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  -v /etc/hostname:/host/etc/hostname:ro \
  devforth/hothost bash



Debugging

# Server

## Environment variables
HOTHOST_WEB_USERNAME - username for first created user
HOTHOST_WEB_PASSWORD_MD5 - password md5 hash for the user;
HOTHOST_WEB_PORT - porst on which web server is listening (default 8007);
HOTHOST_WEB_JWT_SECRET - jwt secret used to generate auth tokens;

Default local credentials:
- admin:123456

How to run:
- Apply migrations using: `npm run migrate`
- Run the server using: `npm start`
