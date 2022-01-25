FROM node:latest

ADD . /mtv
WORKDIR /mtv

RUN npm install -g serve \
 && npm run clean \
 && npm install \
 && npm run build
