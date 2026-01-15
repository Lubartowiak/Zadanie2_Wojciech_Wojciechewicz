FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

# Angular output jest w dist/brilliant-web/browser
COPY brilliant-web/dist/brilliant-web/browser/ /usr/share/nginx/html/

EXPOSE 80
