FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# React por defecto usa el puerto 3000, pero lo configuramos para usar 5173
ENV PORT=5173

EXPOSE 5173

CMD ["npm", "start"]