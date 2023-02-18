# HotHost

Lightweight and minimalistic free and opensource Servers and HTTP monitor. 

* 💾 Shows used disk space percentage and ALERT badge if it exceeds configurable threshold (90% by default)
* 🧠 Shows used RAM percentage and ALERT badge if it exceeds configurable threshold (90% by default)
* ☎️ Built-in plugins to setup free Email/Slack/Telegram notifications
* 🪧 Agents installed using **simple code snippets**. Options: Docker/Compose/Bash+curl+crontab.
* 🏙 Allows to monitor as many hosts as needed
* ⏰️ Configurable monitoring interval
* 📈 View top 10 processes consuming RAM, historically over last 2 days.
* 🌐 HTTP / HTTPS Monitor, status code check, webpage keywords existence, basic auth, notifications
* 🔒 HTTPS SSL check with expiration reminder (default is 14 days prior to expire, configurable)

For each host it allows to see:

* OS version
* CPU model
* RAM size and current RAM ussage
* See whether SWAP is enabled and whether it is used

## [👉🏼 STEP BY STEP INSTALLATION GUIDE](https://devforth.io/blog/critical-server-alerts-with-hothost-open-source-quick-to-setup-disk-ram-notifier/)

# Preview

Hosts view:

![image](https://user-images.githubusercontent.com/1838656/196886907-c90e5e36-c695-4b56-85f0-aadccd125140.png)


Add new host box:

![image](https://user-images.githubusercontent.com/1838656/196889285-c9c6b7c3-d665-4c8f-b615-be990599168d.png)


Available notification plugins:

![image](https://user-images.githubusercontent.com/1838656/196889594-5a405ca0-0608-4a39-8a42-b62d74055f99.png)


Analyze top RAM-consuming processes at a time:

<img src="https://user-images.githubusercontent.com/1838656/197183957-e22b2690-f79f-4dcd-a7b7-092ab9622990.gif" width="700"/>

HTTP(s) Monitor setup:

<img src="https://user-images.githubusercontent.com/1838656/196887413-14055152-4114-42e8-841f-cd5ec7c33e50.png" width="500"/>



# Installation

First you need to run HotHost Web Server. Web-server itself, when will be started, will give you clear guide how to add agents via own Web UI. 

You can use any host with public IP. You are responsible for setting up HTTPS.

For HTTPS you can use anything, most simple options:
- Nginx or Traefik with connected external certificate or free Let's Encrypt certificate
- Free Cloudflare CDN which terminates SSL and gives additional layer of security.

We recommend you to check guide how to [setup HotHost with free Cloudflare plan and EC2 Nano](https://devforth.io/blog/critical-server-alerts-with-hothost-open-source-quick-to-setup-disk-ram-notifier/)

If you have existing Docker/Compose stacks, you can use snippets below:

## Docker Compose

Add to your existing compose stack:

```
version: '3.5'

services:
  hothost-web:
    image: devforth/hothost-web
    restart: always
    environment:
      - HOTHOST_WEB_ADMIN_USERNAME=admin
      - HOTHOST_WEB_ADMIN_PASSWORD=!!!CHANGE_ME!!!
      - HOTHOST_WEB_PORT=8007
    ports:
      - 8007:8007
    volumes:
      - v-hothost-data:/var/lib/hothost/data/
volumes:
  v-hothost-data:
```

Now you should proxy https://subdomain.yourdomain.com to serve requests from 127.0.0.1:8007.

Example Nginx Proxy:

```
server {
  listen 443;
  server_name subdomain.yourdomain.com;
  ssl_certificate     wildcard.crt;
  ssl_certificate_key   wildcard.key;

  charset utf-8;
  client_max_body_size 75M;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 8;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_min_length 256;
  gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;

  location / {
      proxy_read_timeout 220s;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_redirect off;
      proxy_pass http://127.0.0.1:8007;
  }
}
```


* After that Use https://subdomain.yourdomain.com to view as admin and add new agents



### Pure Docker

If you are not using Compose, rhen just install Docker to your host with public IP and run folowwing command:

```
mkdir -p /www/hothostdata
docker run -d --name=hothost-web \
  -v /www/hothostdata:/var/lib/hothost/data/  \
  --env HOTHOST_WEB_ADMIN_USERNAME=admin  \
  --env HOTHOST_WEB_ADMIN_PASSWORD=!!!CHANGE_ME!!!  \
  --restart=always  \
  --env HOTHOST_WEB_PORT=8007  \
  -p 8007:8007  \
  devforth/hothost-web
```


# Updating Web

```
docker pull devforth/hothost-web:latest
```

then recreate a contaner

# Plugin development

Every plugin is a standalone .js in ESM format (with exports/imports, CommonJS with require is not supported). File should have a defined structure. Use `server/src/plugins/slack.js` for a Hello-World example. It is well documented

Currently plugin file should be placed into `server/src/plugins` directory.

If you want to bundle some dedicated node modules then you need to bundle them using webpack or other bundler which supports ESM outputs. Please see `server/src/plugins/gmail.src/gmail.src.js` - it bundels node-mailer into plugin.


# Development


Default local credentials:
- admin:123456

How to run:
- Apply migrations using: `npm run migrate`
- Run the server using: `npm start`
