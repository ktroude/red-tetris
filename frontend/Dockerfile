FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install font-awesome
RUN npm install react-redux @reduxjs/toolkit
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]