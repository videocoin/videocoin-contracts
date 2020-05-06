FROM node:10

WORKDIR /contracts

COPY . .

RUN npm_config_user=root npm i -g truffle@5.1.24

RUN npm_config_user=root npm i -g solc@0.5.17

RUN cd /contracts

RUN npm install --production

RUN truffle compile

CMD ["bash"]