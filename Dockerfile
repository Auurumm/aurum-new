FROM node:18-alpine
WORKDIR /app

# package.json 복사
COPY package*.json ./

# npm ci 대신 npm install 사용
RUN npm install --production

# 소스코드 복사
COPY . .

# 빌드
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]