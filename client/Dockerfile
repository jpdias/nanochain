FROM node:7.10

LABEL version="0.0.1"

RUN mkdir /client
ADD package.json /client/
ADD /client/app.js /client/
ADD /client/snapshots.js /client/

RUN cd /client && npm install

EXPOSE 1337

ENTRYPOINT cd /client && npm install && npm run prod-client