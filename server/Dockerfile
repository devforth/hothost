FROM node:16-alpine

ENV DATABASE_URL="file:/var/lib/hothost/data.db"
WORKDIR /code/

ADD package.json .
ADD package-lock.json .

RUN npm ci

ADD . .
RUN ./node_modules/.bin/tailwindcss -i ./static/css/input.css -o ./static/css/output.css
RUN ./node_modules/.bin/prisma generate

CMD [ "/bin/sh", "-c", "./node_modules/.bin/prisma migrate deploy && node src/index.js" ]