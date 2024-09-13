FROM node:latest
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY ./ /app
EXPOSE 8080
CMD ["/start.sh"]