#!/bin/bash
# Runs from Plesk Git "additional deployment actions".
# Plesk's deployment shell has NO Node on its PATH, and the location of Plesk's
# Node toolkit varies between servers (the version-directory name differs). So we
# locate the real `node` binary under Plesk's node dir, prepend its folder to
# PATH, then install + build. Keeping this in the repo means future fixes are a
# code change + push — no Plesk edits needed.
set -e

# Find Plesk's Node.js bin directory (the folder containing the real node binary).
NODE_BIN=""
for base in /opt/plesk/node /opt/plesk /usr/local /usr/lib/node_instances; do
  [ -d "$base" ] || continue
  found="$(find "$base" -maxdepth 4 -type f -name node 2>/dev/null | grep -E '/bin/node$' | head -1)"
  if [ -n "$found" ]; then NODE_BIN="$(dirname "$found")"; break; fi
done

if [ -n "$NODE_BIN" ]; then
  export PATH="$NODE_BIN:$PATH"
fi

echo "→ node: $(command -v node || echo 'NOT FOUND')"
echo "→ npm:  $(command -v npm  || echo 'NOT FOUND')"

npm ci
npm run deploy
