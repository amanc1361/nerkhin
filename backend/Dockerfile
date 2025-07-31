# ------------------------------------
# Stage 1: Build the Go binary
# ------------------------------------
FROM golang:1.23-alpine AS builder

WORKDIR /app

# نصب ابزارهای مورد نیاز برای CGO + WebP
RUN apk add --no-cache \
    git \
    gcc \
    musl-dev \
    libwebp-dev

# نصب وابستگی‌ها
COPY go.mod go.sum ./
RUN go mod download

# کپی سورس‌کد
COPY . .

# بیلد با پشتیبانی از CGO (WebP)
RUN CGO_ENABLED=1 GOOS=linux go build -o /nerkhin-app ./cmd/nerkhin/main.go

# ------------------------------------
# Stage 2: Minimal runtime container
# ------------------------------------
FROM alpine:3.19

WORKDIR /

# نصب فقط libwebp و ca-certificates برای runtime
RUN apk add --no-cache \
    libwebp \
    ca-certificates

# کپی باینری و فایل‌های مورد نیاز
COPY --from=builder /nerkhin-app /nerkhin-app
COPY --from=builder /app/scripts/db/migrations /migrations

# ایجاد یوزر امن
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["/nerkhin-app"]
