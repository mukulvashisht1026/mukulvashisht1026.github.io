FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY docker.nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY portfolio.json /usr/share/nginx/html/portfolio.json
COPY Profile.pdf /usr/share/nginx/html/Profile.pdf
COPY css /usr/share/nginx/html/css/
COPY images /usr/share/nginx/html/images/
COPY js /usr/share/nginx/html/js/
COPY fonts /usr/share/nginx/html/fonts/
COPY --from=build /app/game/ /usr/share/nginx/html/game/
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
EXPOSE 8080
