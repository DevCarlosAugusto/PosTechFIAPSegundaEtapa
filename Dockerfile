FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${APP_PORT}

CMD ["npm", "start"]
