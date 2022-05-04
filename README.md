# HotHost

Lightweight and minimalistic Open-Source hosts monitor. 

* Shows used disk space percentage and WARNING badge if it exceeds some threshold (e.g. 80%)
* Has public page protected with Basic Auth to watch status with some external monitor (e.g. UptimeRobot to show Slack notification when there is a WARNIGN keyword on page)
* Agents could be easily installed with Docker/Compose/Bash+curl+crontab. Super simple snippets are shown when you click one button on Web
* Allows to monitor as many servers as needed
* Configurable monitoring interval
* Based on alpine minimalistic Docker images

For each host it allows to see:

* OS version
* CPU model
* RAM size and current RAM ussage
* See whether SWAP is enabled and whether it is used

# Preview

![](preview.jpeg)

Add new host form:

![](preview-add-monitor.jpeg)

# Installation

First you need to run HotHost Web Server. It will then give you clear guide how to add agents. 
You can use any host with public IP. You are responsible for setting up SSL. 

You can use one of next options:
- Nginx or traefik with connected external certificate or free Let's Encrypt certificate
- Free Cloudflare CDN which terminates SSL and gives additional layer of cecurity.


# Web Server

## Docker Compose

First setup HotHost Web, for example to add it into existing compose stack:

```
version: '3.5'

services:
  hothost-web:
    image: devforth/hothost-web
    environment:
      - HOTHOST_WEB_ADMIN_USERNAME=admin
      - HOTHOST_WEB_ADMIN_PASSWORD=!!!CHANGE_ME!!!
      - HOTHOST_WEB_PUBLIC_BASIC_USERNAME=admin
      - HOTHOST_WEB_PUBLIC_BASIC_PASSWORD=!!!CHANGE_ME!!!
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

Now you should proxy https://subdomain.yourdomain.com to serve requests from 127.0.0.1:8007.

* Use https://subdomain.yourdomain.com to view as admin and add new agents
* Use https://subdomain.yourdomain.com/public/ with basic auth credentials. You can add this to setup e.g. UptimeRobot monitor and watch for `WARNING` keyword to prevent disk space issues

## Pure Docker

In case if you want to use pure docker:

```
mkdir -p /www/hothostdata
docker run -d --name=hothost-web \
  -v /www/hothostdata:/var/lib/hothost/data/
  --env HOTHOST_WEB_ADMIN_USERNAME=admin
  --env HOTHOST_WEB_ADMIN_PASSWORD=!!!CHANGE_ME!!!
  --env HOTHOST_WEB_PUBLIC_BASIC_USERNAME=admin
  --env HOTHOST_WEB_PUBLIC_BASIC_PASSWORD=!!!CHANGE_ME!!!
  --env HOTHOST_WEB_PORT=8007
  -p 8007:8007
  devforth/hothost-web
```

# Development


Default local credentials:
- admin:123456

How to run:
- Apply migrations using: `npm run migrate`
- Run the server using: `npm start`
