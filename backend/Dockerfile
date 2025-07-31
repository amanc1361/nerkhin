# ------------------------------------
# Stage 1: Build the Go binary
# ------------------------------------
FROM golang:1.23.1-alpine AS builder

WORKDIR /app

# Install git (for go get if needed)
RUN apk add --no-cache git

# Copy go modules and download dependencies early
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build statically linked Go binary
RUN CGO_ENABLED=1 GOOS=linux go build -o /nerkhin-app ./cmd/nerkhin/main.go

# ------------------------------------
# Stage 2: Minimal runtime container
# ------------------------------------
FROM alpine:3.19

WORKDIR /

# Copy only what we need: binary and migrations
COPY --from=builder /nerkhin-app /nerkhin-app
COPY --from=builder /app/scripts/db/migrations /migrations

# Optionally add ca-certificates (for https calls)
RUN apk add --no-cache ca-certificates

# Use non-root user (for security)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["/nerkhin-app"]
    