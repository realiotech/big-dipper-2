FROM node:23-alpine

ARG PORT
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_GRAPHQL_WS
ARG NEXT_PUBLIC_RPC_WEBSOCKET
ARG NEXT_PUBLIC_CHAIN_TYPE
ARG PRICE_API_URL
ARG PRICE_API_KEY
ARG NODE_ENV

# Install git for ui and internal packages
RUN apk add --no-cache git

# Set app directory
WORKDIR /app

# Installing dependencies
RUN mkdir node_modules
COPY package*.json ./
RUN npm ci
RUN npx browserslist@latest --update-db

# Copying source files
COPY . .

# RUN npm run build:next
RUN npm run build:next
EXPOSE ${PORT}
ENTRYPOINT ["npm", "run", "start"]