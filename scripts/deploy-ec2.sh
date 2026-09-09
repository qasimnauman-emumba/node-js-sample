#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_NAME="$1"
APP_PORT="$2"
APP_NAME="node-js-sample"
APP_DIR="$HOME/node-js-sample"

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

cd "${APP_DIR}"

tar -xzf "${ARCHIVE_NAME}"
npm install --production

if ! command -v pm2 >/dev/null 2>&1; then
    echo "pm2 not found, installing..."
    npm install -g pm2
fi

PORT="${APP_PORT}" pm2 restart "${APP_NAME}" || PORT="${APP_PORT}" pm2 start index.js --name "${APP_NAME}"
