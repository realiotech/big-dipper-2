#!/usr/bin/env sh

NODE_ENV=production npm run build

ls -lha /app/.next

ls -lha /app/dist

echo "Next.js build ready"