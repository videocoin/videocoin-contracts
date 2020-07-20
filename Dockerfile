FROM node:10

ARG tag

ENV TAG=$tag

WORKDIR /contracts

COPY . .

RUN npm_config_user=root npm i -g truffle@5.1.24

RUN npm_config_user=root npm i -g solc@0.5.13

RUN cd /contracts

RUN npm install --production

RUN truffle compile

CMD ["bash"]