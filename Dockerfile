FROM node:14

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json .
COPY yarn.lock .
RUN yarn install

RUN yarn global add firebase-tools nodemon

# Copying source files
COPY . .

# Building app
EXPOSE 3000

# Running the app
CMD ["yarn", "dev"]