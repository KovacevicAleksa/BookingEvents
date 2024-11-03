FROM golang:1.21-alpine

WORKDIR /app

COPY main.go .
COPY go.mod .

RUN go mod download
RUN go build -o main .

EXPOSE 8181
CMD ["./main"]