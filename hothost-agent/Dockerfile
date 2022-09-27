FROM alpine

RUN apk update && apk add bash curl procps
ADD getinfo.sh .

CMD [ "bash", "getinfo.sh" ]