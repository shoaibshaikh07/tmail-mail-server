FROM alpine:latest

# Install Node.js
RUN apk add --update nodejs npm
# RUN apk add --no-cache bash

# Install Bun
RUN apk add --no-cache bash curl unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

EXPOSE 25

CMD ["bun", "start"]