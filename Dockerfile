# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Accept API URL as build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite app
# Note: Variables like VITE_API_URL must be available at build time
# If you pass them via --build-arg in docker build, they will be bundled here.
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy the build output to replace the default nginx contents
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a custom nginx configuration for client-side routing (React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
