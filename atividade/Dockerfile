FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY tests ./tests
COPY agentes ./agentes
COPY cenarios ./cenarios
COPY entradas ./entradas
RUN npx tsc --noEmit && mkdir -p artefatos && chown node:node artefatos
USER node
ENTRYPOINT ["node", "--import", "tsx", "src/cli.ts"]
CMD ["--ajuda"]
