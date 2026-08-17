#!/bin/bash
# Plesk deploy-actions runner. Plesk's deploy shell has no Node on PATH and the
# Node toolkit location varies per server, so we search for it, add it to PATH,
# then install + build. Diagnostics are written to a web-readable file
# (public/_deploydbg.txt) so the environment can be inspected without SSH.
set -e

DBG="public/_deploydbg.txt"
mkdir -p public

locate_node_bin() {
  local d f
  # Common Plesk / system / nvm locations first (fast).
  for d in $(ls -d /opt/plesk/node/*/bin 2>/dev/null) \
           /usr/local/bin /usr/bin \
           $HOME/.nvm/versions/node/*/bin \
           /var/www/vhosts/system/*/nodejs/*/bin ; do
    if [ -x "$d/npm" ] || [ -x "$d/node" ]; then echo "$d"; return 0; fi
  done
  # Broad fallback search for the real node binary.
  f="$(find /opt/plesk /usr/local /usr/lib "$HOME" -maxdepth 6 -type f -name node 2>/dev/null | grep -E '/bin/node$' | head -1)"
  [ -n "$f" ] && { dirname "$f"; return 0; }
  return 1
}

NODE_BIN="$(locate_node_bin || true)"
[ -n "$NODE_BIN" ] && export PATH="$NODE_BIN:$PATH"

{
  echo "=== deploy debug $(date -u 2>/dev/null) ==="
  echo "whoami=$(whoami)  HOME=$HOME  pwd=$(pwd)"
  echo "NODE_BIN=$NODE_BIN"
  echo "node=$(command -v node)  npm=$(command -v npm)"
  echo "--- ls /opt/plesk/node ---"; ls -la /opt/plesk/node 2>&1
  echo "--- find node (bounded) ---"; find /opt/plesk /usr/local /usr/bin "$HOME" -maxdepth 6 -type f -name node 2>/dev/null | grep -E '/bin/node$' | head -20
} | tee "$DBG" >&2

command -v npm >/dev/null || { echo "npm still not found — diagnostics written to $DBG" >&2; exit 1; }

npm ci
npm run deploy
