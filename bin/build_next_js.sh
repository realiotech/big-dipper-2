#!/usr/bin/env sh

NODE_ENV=production npm run build

ls -lha /app/.next

echo "Next.js build ready"