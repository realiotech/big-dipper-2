#!/usr/bin/env sh

NODE_ENV=production npm run build:deploy

ls -lha /app/.next

echo "Next.js build ready"