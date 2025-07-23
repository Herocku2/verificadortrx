FROM node:18-alpine

# Install dependencies
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy app source
COPY . .

# Set environment
ENV NODE_ENV=development

# Build the admin panel
RUN npm run build

# Expose port
EXPOSE 1337

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S strapi -u 1001

# Change ownership
RUN chown -R strapi:nodejs /opt/app
USER strapi

# Start the application
CMD ["npm", "start"]