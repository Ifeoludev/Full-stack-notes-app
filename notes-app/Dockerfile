FROM node:20
ENV DEBUG="notes:*"
ENV PORT="3000"
ENV SEQUELIZE_CONNECT="sequelize-docker-mysql.yaml"
# ENV NOTES_MODEL="notes-sequelize" 
# This environment variable is defaulting to sequelize in the code, but can be set here if needed.
# For Docker we want standard network listening
RUN mkdir -p /notes
WORKDIR /notes
COPY . /notes/
RUN apt-get update -y \
  && apt-get -y install curl python3 build-essential git ca-certificates \
  && npm install --unsafe-perm
EXPOSE 3000
CMD npm run docker
