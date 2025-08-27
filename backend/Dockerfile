# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

# Env agar data & upload diarahkan ke volume /data di server
ENV PORT=3000 \
    DATA_DIR=/data \
    UPLOAD_DIR=/data/uploads \
    DB_FILE=/data/data.db

EXPOSE 3000
CMD ["npm","start"]
