# Use Node.js LTS version with Alpine
FROM node:lts-alpine

# Set environment to production
ENV NODE_ENV=production

# Create and set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production && mv node_modules ../

# Copy application files
COPY . .

# Expose port
EXPOSE 8081

# Change ownership of application files to non-root user
RUN chown -R node /usr/src/app

# Switch to non-root user
USER node

# Start the application
CMD ["node", "server.js"]
