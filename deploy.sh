#!/bin/bash
# Plesk's Git deploy shell starts with a near-empty PATH — even coreutils like
# `tee` and `find` are missing, which is why `npm` was never found. So the first
# job is to establish a full PATH: standard system dirs + Plesk's Node toolkit
# (whose version-directory name varies per server). Then install + build.
set -e

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
for d in /opt/plesk/node/*/bin "$HOME"/.nvm/versions/node/*/bin; do
  [ -d "$d" ] && PATH="$d:$PATH"
done
export PATH

# If npm still isn't visible, hunt for the node binary (coreutils are on PATH now).
if ! command -v npm >/dev/null 2>&1; then
  nodebin="$(find /opt/plesk /usr/local /usr/lib "$HOME" -maxdepth 6 -type f -name node 2>/dev/null | grep -E '/bin/node$' | head -1)"
  [ -n "$nodebin" ] && export PATH="$(dirname "$nodebin"):$PATH"
fi

echo "-> node=$(command -v node)  npm=$(command -v npm)" >&2

npm ci
npm run deploy
