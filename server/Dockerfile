# Build
FROM golang:1.27-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# Run
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
# .env в образ не копируется — переменные передаёт docker compose (env_file).
EXPOSE 3000
ENV GODEBUG="netdns=go+1"
CMD ["./main"]
