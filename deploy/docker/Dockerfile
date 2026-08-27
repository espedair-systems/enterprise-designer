# Multi-stage Docker build for Business Artist (arch-ba-deploy)
FROM node:20-alpine AS web-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM golang:1.24-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web-builder /app/web/dist ./web/dist
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/ba ./cmd/ba

FROM alpine:3.19
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata
COPY --from=go-builder /bin/ba /app/ba
COPY config.yaml /app/config.yaml
EXPOSE 8082
ENTRYPOINT ["/app/ba"]
CMD ["server", "--config", "/app/config.yaml"]
