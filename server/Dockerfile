FROM node:20.9.0-alpine

WORKDIR /app/server

COPY package*.json ./

RUN npm install

COPY ./prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 8080

ENV PORT 8080

RUN npx prisma --version

CMD ["npm", "run", "start"]
