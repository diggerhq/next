# Use an official Node runtime as the base image
FROM node:18-alpine


ARG NEXT_PUBLIC_SSO_DOMAIN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SSO_DOMAIN=$NEXT_PUBLIC_SSO_DOMAIN
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Install pnpm
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN CI=true pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
