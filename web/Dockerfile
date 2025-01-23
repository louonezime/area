FROM node:latest

WORKDIR /app/web

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 8081

ENV PORT 8081

CMD ["npm", "run", "start"]
