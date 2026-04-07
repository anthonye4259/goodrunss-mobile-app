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
RUN mkdir -p /app/data /app/tmp

EXPOSE 3000

CMD ["npm", "start"]
