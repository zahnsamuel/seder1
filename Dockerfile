FROM node:24-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV PORT=4180
# Default to SQLite hosted mode from the image itself, so the container never falls back to the
# insecure local-development mode even if render.yaml's env var / disk did not apply (e.g. the service
# was created as a plain Web Service, not a Blueprint). /data is created here so SQLite works whether
# or not a persistent disk is mounted over it: a mounted disk (render.yaml) makes learner data durable
# across redeploys; without one it is ephemeral, but the deploy still has token auth, account
# isolation, and a gated analytics endpoint. Override SEDER_DB in the environment to change the path.
RUN mkdir -p /data
ENV SEDER_DB=/data/seder.db
EXPOSE 4180
CMD ["node", "server.mjs"]
