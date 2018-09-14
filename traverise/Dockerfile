FROM ubuntu

RUN apt-get -q update
RUN apt-get install --yes curl
RUN apt-get install -y sudo
RUN apt-get install -y gnupg
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN apt-get install -y nodejs

RUN apt-get install -y build-essential

COPY . /app/traverise
WORKDIR /app/traverise

CMD ["npm", "install"]

EXPOSE 3000

# CMD ["npm", "start"]

CMD ["node", "server.js"]