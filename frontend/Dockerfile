# BUILD STAGE
# full Node.js image which is needed to run npm
FROM node:20-alpine AS build
WORKDIR /app

# build-time only variable, exists while image is being built only, overriden later in yml
# set as ENV to maek it visibile to build command at that moment
# once React app is built into static files, no running process to read .env files, whatever VITE_API_URL is at build time must be set in stone into that compiled JS 
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# copy just package.json and package-lock.json, install dependencies
# copy rest of source code then build, prevents re-downloading of dependencies every time
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# RUNTIME STAGE
# copies only compiled dist/ folder from build stage into Caddy's file-serving directory
FROM caddy:2-alpine AS runtime
COPY --from=build /app/dist /usr/share/caddy
