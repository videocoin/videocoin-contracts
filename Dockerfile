FROM node:10

ARG tag="stub 9999.9999.9999"

WORKDIR /contracts

COPY . .

RUN npm_config_user=root npm i -g truffle@5.1.24

RUN npm_config_user=root npm i -g solc@0.5.13

RUN cd /contracts

RUN npm install --production

RUN python3 tools/set_version.py --value $tag --path contracts/tools/Versionable.sol

RUN truffle compile

CMD ["bash"]