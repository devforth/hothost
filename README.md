# hothost


First you need to run HotHost web. It will then give you clear guide how to add agents. 
You can use any host with public IP. You are responsible for setting up SSL. 

You can use one of next options:
- Nginx or traefik with connected external certificate or free Let's Encrypt certificate
- Free Cloudflare CDN which terminates SSL and gives additional layer of cecurity.

```
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
```


Debugging

# Server

## Compose
```
version: '3.5'

services:
  hothost-web:
    image: devforth/hothost-web
    environment:
      - HOTHOST_WEB_ADMIN_USERNAME=admin
      - HOTHOST_WEB_ADMIN_PASSWORD=123456
      - HOTHOST_WEB_PUBLIC_BASIC_USERNAME=admin
      - HOTHOST_WEB_PUBLIC_BASICPASSWORD=123456
      - HOTHOST_WEB_PORT=8007
    ports:
      - 8007:8007
    volumes:
      - v-hothost-data:/var/lib/hothost/data/
volumes:
  v-hothost-data:
```

To create password MD5 hash for adyour user execute this command and it will show MD5:

```
docker run python:3-alpine python -c "import hashlib;print(hashlib.md5('YOUR_PASSWORD_HERE'.encode()).hexdigest())"
```



## Environment variables
- HOTHOST_WEB_ADMIN_USERNAME - username for first created admin
- HOTHOST_WEB_ADMIN_PASSWORD_MD5 - password md5 hash for the user;
- HOTHOST_WEB_PORT - porst on which web server is listening (default 8007);
- HOTHOST_WEB_JWT_SECRET - jwt secret used to generate auth tokens;

Default local credentials:
- admin:123456

How to run:
- Apply migrations using: `npm run migrate`
- Run the server using: `npm start`
