FROM node:16-alpine as cssBuilder
WORKDIR /code/

ADD html .

RUN npm ci
RUN ./node_modules/.bin/tailwindcss -i input.css -o dist/css/output.css

FROM node:16-alpine

WORKDIR /code/

ADD package.json .
ADD package-lock.json .

RUN npm ci

ADD html html
COPY --from=cssBuilder /code/dist/ static/

ADD . .

CMD [ "/bin/sh", "-c", "node src/index.js" ]
ENTRYPOINT []