# Use an official Node runtime as the base image
FROM node:18-alpine

ARG DATABASE_URL
ARG NEXT_PUBLIC_SSO_DOMAIN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG SUPABASE_DATABASE_PASSWORD
ARG SUPABASE_JWT_SECRET
ARG SUPABASE_PROJECT_REF
ARG GITHUB_PROXY_CALLBACK_URL
ARG DIGGER_WEBHOOK_SECRET
ARG DIGGER_TRIGGER_APPLY_URL
ENV NEXT_PUBLIC_SSO_DOMAIN=$NEXT_PUBLIC_SSO_DOMAIN
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV SUPABASE_DATABASE_PASSWORD=${SUPABASE_DATABASE_PASSWORD}
ENV SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
ENV SUPABASE_PROJECT_REF=${SUPABASE_PROJECT_REF}
ENV GITHUB_PROXY_CALLBACK_URL=${GITHUB_PROXY_CALLBACK_URL}
ENV DIGGER_WEBHOOK_SECRET=${DIGGER_WEBHOOK_SECRET}
ENV DIGGER_TRIGGER_APPLY_URL=${DIGGER_TRIGGER_APPLY_URL}
ENV DATABASE_URL=${DATABASE_URL}

# Install pnpm
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json  ./
COPY prisma ./prisma

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN CI=true pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
ENTRYPOINT "pnpm start"
