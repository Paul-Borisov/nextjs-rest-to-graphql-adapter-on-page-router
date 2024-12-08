FROM node:22-alpine

WORKDIR /usr/app

COPY ./package*.json /usr/app/
COPY .npmrc .npmrc
RUN npm i

COPY . /usr/app
RUN sed -i 's|http://localhost|#http://localhost|g' .env.local
RUN sed -i 's|//output|output|g' next.config.mjs

RUN npm run build-standalone-unix

EXPOSE 3000

ENTRYPOINT ["npm", "run", "standalone"]