FROM node:23-alpine

ARG NEXT_PUBLIC_CHAIN_TYPE
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_GRAPHQL_WS
ARG NEXT_PUBLIC_RPC_WEBSOCKET
ARG NEXT_PUBLIC_SUBGRAPHQL_URL
ARG NODE_ENV
ARG PORT
ARG PRICE_API_KEY
ARG PRICE_API_URL

# Set app directory
WORKDIR /app

# Installing dependencies
COPY package*.json ./
RUN npm ci
RUN npx browserslist@latest --update-db

# Copying source files
COPY . .

# RUN npm run build:next
RUN npm run build:next
EXPOSE ${PORT}

ENTRYPOINT ["npm", "run", "start"]
