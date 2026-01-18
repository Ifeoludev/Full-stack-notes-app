FROM node:20
ENV DEBUG="users:*"
ENV PORT="3333"
ENV SEQUELIZE_CONNECT="sequelize-docker-mysql.yaml"
ENV REST_LISTEN="0.0.0.0"
RUN mkdir -p /userauth
WORKDIR /userauth
COPY . /userauth/
RUN apt-get update -y \
  && apt-get -y install curl python3 build-essential git ca-certificates \
  && npm install --unsafe-perm
EXPOSE 3333
CMD npm run docker
