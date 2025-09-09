# ------------------------------------
# Stage 1: Build the Go binary
# ------------------------------------
FROM golang:1.23-alpine AS builder

WORKDIR /app
ENV GOTOOLCHAIN=auto
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
COPY --from=builder /app/assets/fonts /assets/fonts
# --- ADD ONLY (do not modify existing lines) ---
# Headless Chromium + پیش‌نیازهای رندر متن
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    font-noto-emoji
# مسیر اجرایی Chromium برای chromedp
ENV CHROMEDP_EXEC_PATH=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

# فولدرهای لازم برای اجرای کروم به‌صورت غیرروت (بدون نیاز به chown جابه‌جا کردن خطوط)
RUN mkdir -p /home/appuser/.cache /home/appuser/.config /home/appuser/Downloads /tmp && \
    chmod -R 777 /home/appuser /tmp    

# ایجاد یوزر امن
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["/nerkhin-app"]




