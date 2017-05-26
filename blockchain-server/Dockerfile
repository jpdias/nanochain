FROM node:7.10

LABEL version="0.0.1"

RUN mkdir /blockchain-server
ADD package.json /blockchain-server/
ADD /blockchain-server/main.js /blockchain-server/
ADD /blockchain-server/genesisBlock.json /blockchain-server/

RUN mkdir /blockchain-server/resources
RUN mkdir /blockchain-server/resources/keys

RUN apt-get -y install openssh-client 

RUN cd /blockchain-server/resources/keys && \
    openssl genrsa -out private_key.pem 1024 && \
    openssl rsa -in private_key.pem -pubout > public_key.pem

RUN cd /blockchain-server && npm install

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT cd /blockchain-server && npm install && PEERS=$PEERS npm run prod-blockchain