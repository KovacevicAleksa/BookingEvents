# Use the official Go image with version 1.21 on Alpine Linux for a lightweight environment
FROM golang:1.21-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the main Go file and module file into the container
COPY main.go .
COPY go.mod .

# Download dependencies specified in go.mod
RUN go mod download

# Build the Go application, outputting an executable named "main"
RUN go build -o main .

# Expose port 8181 for the application to listen on
EXPOSE 8181

# Set the command to run the application
CMD ["./main"]
