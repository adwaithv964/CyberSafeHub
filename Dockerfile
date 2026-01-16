FROM node:18-bullseye

# Install System Dependencies
# 1. LibreOffice (for Documents)
# 2. FFmpeg (Backup/System level)
# 3. Fonts (for good rendering)
RUN apt-get update && apt-get install -y \
    libreoffice \
    ffmpeg \
    fonts-opensymbol \
    hyphen-fr \
    hyphen-de \
    hyphen-en-us \
    hyphen-it \
    hyphen-ru \
    fonts-dejavu \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    fonts-droid-fallback \
    fonts-dustin \
    fonts-f500 \
    fonts-fanwood \
    fonts-freefont-ttf \
    fonts-liberation \
    fonts-lmodern \
    fonts-lyx \
    fonts-sil-gentium \
    fonts-texgyre \
    fonts-tlwg-purisa \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Package Files
COPY package*.json ./

# Install Node Dependencies
RUN npm install

# Copy App Source
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start
CMD ["node", "index.js"]
