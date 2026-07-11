FROM node:24-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV PORT=4180
EXPOSE 4180
CMD ["node", "server.mjs"]
