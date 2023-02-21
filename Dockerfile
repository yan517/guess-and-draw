FROM node:latest

COPY app.js socket.js package.json /app/

COPY routes /app/routes

COPY public /app/public

COPY utils /app/utils

COPY templates /app/templates

WORKDIR /app

RUN npm install && npm cache clean --force

CMD node app.js