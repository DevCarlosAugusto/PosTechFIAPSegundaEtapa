# Use uma imagem Node.js oficial como base
FROM node:20-alpine as build-stage

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos de dependência para o diretório de trabalho
# Use COPY com o pacote.json e package-lock.json primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Exponha a porta que sua aplicação Express escuta
EXPOSE 3000 # Altere para a porta que sua aplicação usa, se for diferente

# Comando para rodar a aplicação quando o contêiner iniciar
CMD ["npm", "start"]
