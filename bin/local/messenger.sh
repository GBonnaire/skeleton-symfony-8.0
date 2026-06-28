#!/bin/bash

cd /var/www/app
php bin/console messenger:consume async --limit=10