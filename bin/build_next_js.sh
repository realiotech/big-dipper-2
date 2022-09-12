#!/usr/bin/env sh

NODE_ENV=production npm run build

ls -lha /app

ls -lha /app/.next

echo "Next.js build ready"