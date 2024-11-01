# Use Node.js LTS version with Alpine Linux to ensure a lightweight and stable environment
FROM node:lts-alpine

# Install curl
RUN apk add --no-cache curl

# Set environment to production to optimize performance and exclude development dependencies
ENV NODE_ENV=production

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files to the working directory
# This step separates package management from code copying to leverage Docker's cache
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# Install production dependencies and move node_modules to the parent directory to optimize image size
RUN npm install --production && mv node_modules ../

# Copy the rest of the application files into the working directory
COPY . .

# Expose port 8081 so that the container's application can be accessed externally
EXPOSE 8081

# Change the ownership of the application files to the non-root user 'node'
RUN chown -R node /usr/src/app

# Switch to the non-root user 'node' for better security
USER node

# Start the application using Node.js
CMD ["node", "server.js"]
