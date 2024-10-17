# Use the official Node.js image from the Docker Hub.
FROM node:14  # You can specify the version you need

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if it exists) to the working directory.
COPY package*.json ./

# Install the application dependencies.
RUN npm install

# Copy the rest of your application code to the working directory.
COPY . .

# Expose the port the app runs on (adjust this based on your app).
EXPOSE 3000

# Command to run your application.
CMD ["node", "server.js"]  # Replace 'server.js' with your actual entry file
