#!/usr/bin/env sh

ls -lha /app/.next
ls -lha /app/dist

exec node /app/dist/index.js