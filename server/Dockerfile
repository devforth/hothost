FROM node:16-alpine

WORKDIR /code/

ADD package.json .
ADD package-lock.json .

RUN npm ci

ENTRYPOINT [ "/bin/sh", "-c", "npm run prisma deploy" ]