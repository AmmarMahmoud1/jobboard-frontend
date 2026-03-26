#!/bin/sh
set -e

# Substitute only BACKEND_URL, leaving nginx variables ($host, etc.) intact
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
