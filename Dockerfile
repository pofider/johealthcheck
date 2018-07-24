FROM node:alpine
EXPOSE 1000

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
CMD [ "node", "index.js" ]