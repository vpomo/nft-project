FROM golang:1.24.2 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -v -o app ./cmd/main.go

FROM alpine:3.21.4

WORKDIR /app

COPY --from=builder /app/app .
# COPY --from=builder /app/.env . # Optional: uncomment if you want to copy .env from the builder stage

EXPOSE 3010

CMD ["./app"]
