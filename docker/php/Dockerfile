FROM php:8.4-fpm

RUN apt-get update
RUN apt upgrade -y
RUN apt-get install -y nano

# Package for curl
RUN apt-get install -y curl libcurl4 libcurl4-gnutls-dev
# Package for Intl
RUN apt-get install -y libicu-dev
# Package for composer execution
RUN apt-get install -y libzip-dev zip

# Install npm
RUN curl -sL https://deb.nodesource.com/setup_24.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs
RUN rm nodesource_setup.sh

# Install yarn
RUN npm install --global yarn

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer --version

# Init configuration of php
RUN docker-php-ext-install pdo pdo_mysql
RUN docker-php-ext-install mysqli
RUN docker-php-ext-install zip
RUN docker-php-ext-install curl
RUN docker-php-ext-install intl
RUN docker-php-ext-enable intl
RUN docker-php-ext-install calendar

# install Driver Web (Chromium And Firefox)
RUN apt-get update && apt-get install -y \
    wget unzip curl gnupg ca-certificates \
    chromium chromium-driver firefox-esr \
    && wget -q https://github.com/mozilla/geckodriver/releases/download/v0.36.0/geckodriver-v0.36.0-linux64.tar.gz \
    && tar -xzf geckodriver-v0.36.0-linux64.tar.gz \
    && mv geckodriver /usr/local/bin/ \
    && chmod +x /usr/local/bin/geckodriver \
    && rm geckodriver-v0.36.0-linux64.tar.gz \
    && rm -rf /var/lib/apt/lists/*

COPY ./config.ini /usr/local/etc/php/conf.d/config.ini
RUN chmod 755 /usr/local/etc/php/conf.d/config.ini

RUN usermod -u 1000 www-data
WORKDIR /var/www/app
