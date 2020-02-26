FROM php:7.3-apache

RUN apt-get update &&  \
    apt upgrade -y && \
    apt-get install -y \
    curl \
    wget \
    tidy \
    unzip \
    --no-install-recommends \
    && rm -r /var/lib/apt/lists/*

RUN docker-php-ext-install \
    mbstring \
    mysqli \
    pdo_mysql \
    opcache

COPY ./opcache.ini /usr/local/etc/php/conf.d/opcache.ini

RUN a2enmod rewrite

RUN apt-get update

RUN apt-get install -y libzmq3-dev; \
    apt-get install -y php-pear php-dev; \
    apt-get install -y libcurl3-openssl-dev; \
    apt-get install -y pkg-config; \
    apt-get install -y libevent-dev;

RUN apt-get update

RUN set -eux; apt-get update; apt-get install -y libzip-dev zlib1g-dev; docker-php-ext-install zip

COPY ./App/ /var/www/html/

RUN chown -R www-data:www-data /var/www/html/

WORKDIR /var/www/html/

RUN wget https://hub.taotesting.com/resources/taohub-articles/articles/third-party/MathJax_Install_TAO_3x.sh
RUN chmod u+x MathJax_Install_TAO_3x.sh
RUN ./MathJax_Install_TAO_3x.sh