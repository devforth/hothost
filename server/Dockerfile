FROM node:16-alpine as builder
WORKDIR /code/
ADD frontend/package-lock.json .
ADD frontend/package.json .
RUN npm ci
ADD frontend .
RUN npm run build

FROM node:16-alpine
WORKDIR /code/
ADD package.json .
ADD package-lock.json .
RUN npm ci

ADD . .
COPY --from=builder /code/dist/ frontend/dist/ 

CMD ["node", "src/index.js" ]
ENTRYPOINT []