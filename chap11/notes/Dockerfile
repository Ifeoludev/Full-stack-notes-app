FROM node:20
ENV DEBUG="notes:*,messages:*"
ENV SEQUELIZE_CONNECT="models/sequelize-docker-mysql.yaml"
ENV NOTES_MODEL="sequelize"
ENV USER_SERVICE_URL="http://userauth:3333"
ENV PORT="3000"
ENV NOTES_SESSIONS_DIR="/sessions"

RUN mkdir -p /notesapp
WORKDIR /notesapp

COPY package.json .
RUN npm install

COPY . /notesapp

# Build Tailwind CSS
RUN npm run build-css

VOLUME /sessions
EXPOSE 3000
CMD npm run docker
