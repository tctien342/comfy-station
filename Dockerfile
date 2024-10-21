# Step 1: Use the official Bun image
FROM node:20-slim AS base
RUN npm i -g bun@latest
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production


# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS release
COPY . .
RUN rm -rf node_modules .next
COPY --from=install /temp/dev/node_modules node_modules

# Run bun run build to build the application
ARG NEXT_PUBLIC_APP_URL=http://localhost:3001
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN bun run build

# Step 7: Expose the application ports
EXPOSE 3000
EXPOSE 3001

# Step 8: Run the application
# Define the command to start the application
CMD ["bun", "run", "start"]