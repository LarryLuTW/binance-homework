FROM node:18-slim

ENV NODE_ENV production
WORKDIR /usr/src/app

RUN npm install ts-node -g

# install dependencies
COPY package*.json ./
RUN npm ci

# bundle source code and strategy config
COPY tsconfig.json tsconfig.json
COPY ./src ./src
COPY ./config ./config

CMD ["ts-node", "--transpile-only", "src/index.ts"]
