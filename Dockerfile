# Build stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install the exact reviewed dependency graph
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy the built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (App Platform prefers this port)
EXPOSE 8080

# Copy a custom nginx configuration that uses port 8080
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 