FROM node:6.9

COPY . /usr/service/
WORKDIR /usr/service
RUN apt-get update -q && apt-get install -y ruby; \
gem install sass; \
npm install --production; \
cd app; \
npm install -g grunt; \
npm install; \
grunt; \
rm -rf node_modules; \
cd ..

EXPOSE 8080
CMD [ "npm", "start" ]
