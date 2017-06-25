FROM node:7.10

LABEL version="0.0.1"

RUN mkdir /server
ADD package.json /server/
ADD /server/main.js /server/
ADD /server/genesisBlock.json /server/

RUN mkdir /server/resources
RUN mkdir /server/resources/keys

RUN apt-get -y install openssh-client 

RUN cd /server/resources/keys && \
    openssl genrsa -out private_key.pem 1024 && \
    openssl rsa -in private_key.pem -pubout > public_key.pem

RUN cd /server && npm install

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT cd /server && npm install && PEERS=$PEERS npm run prod-blockchain