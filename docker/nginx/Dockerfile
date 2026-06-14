FROM nginx:latest

# Copy configuration into nginx conf
ADD app.conf /etc/nginx/conf.d/app.conf
RUN rm /etc/nginx/conf.d/default.conf
