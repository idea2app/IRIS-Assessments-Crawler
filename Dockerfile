FROM node:18-slim

USER root

RUN npm rm yarn -g
RUN npm i pnpm -g
RUN apt update && apt install -y ca-certificates wget

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY package.json pnpm-lock.yaml /home/node/app/
RUN pnpm i --frozen-lockfile

COPY . /home/node/app
RUN pnpm build

RUN pnpm prune --prod || true \
    pnpm store prune

EXPOSE 8080
CMD ["npm", "start"]