# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the application files to nginx's serve directory
COPY src /usr/share/nginx/html

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