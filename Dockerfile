FROM node:20-bookworm

# LibreOffice is installed in the app image to keep conversion local and simple.
RUN apt-get update && apt-get install -y libreoffice fonts-dejavu-core && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
