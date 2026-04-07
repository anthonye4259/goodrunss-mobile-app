FROM node:20-slim

# Install canvas system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy rest of app
COPY . .

# Build Next.js
RUN npm run build

# Create data directory for persistent storage
RUN mkdir -p /app/data /app/tmp /app/data-seed

# Copy data files to seed directory (used on first boot if volume is empty)
COPY data/ /app/data-seed/

# Create entrypoint script that seeds the volume on first boot
RUN echo '#!/bin/sh\n\
if [ ! -f /app/data/tiktok-accounts.json ]; then\n\
  echo "Seeding data volume with initial data..."\n\
  cp -r /app/data-seed/* /app/data/ 2>/dev/null || true\n\
fi\n\
exec npm start' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
