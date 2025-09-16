FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Comando para rodar a aplicação quando o contêiner iniciar
CMD ["npm", "start"]
