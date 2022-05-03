FROM alpine

RUN apk update && apk add bash curl
ADD getinfo.sh .

CMD [ "bash", "getinfo.sh" ]