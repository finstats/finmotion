#!/bin/sh
# FinMotion's installer, published at https://finmotion.finstats.no/install.sh by the pages workflow
# (tools/build-site.mjs fills in the list below). Like FinUI, FinMotion is source you copy and own, so installing it is
# copying it: its files as registry.json lists them, and finmotion.css, every stylesheet joined in order. Nothing but sh
# and curl:
#   curl -fsSL https://finmotion.finstats.no/install.sh | sh -s -- [--dir <folder>]
# Run beside FinUI's installer, it makes ./finmotion beside ./finui.
set -eu

SITE="${FINMOTION_SITE:-https://finmotion.finstats.no}"
FILES="@FILES@"

usage() {
  cat <<'HELP'
FinMotion: how FinUI moves.

  curl -fsSL https://finmotion.finstats.no/install.sh | sh -s -- [--dir <folder>]

  --dir <folder>  where to put it (default: finmotion); it must be empty, or not there yet
HELP
}
fail() { printf 'finmotion: %s\n' "$1" >&2; exit 1; }

dir="finmotion"
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --dir) [ $# -ge 2 ] || fail "--dir needs a folder"; dir="$2"; shift ;;
    *) fail "\"$1\" is not an option (--help says which are)" ;;
  esac
  shift
done

if [ -e "$dir" ] && [ -n "$(ls -A "$dir" 2>/dev/null)" ]; then
  fail "$dir already holds files; FinMotion is copied only into an empty folder, so nothing of yours is overwritten."
fi
command -v curl >/dev/null 2>&1 || fail "curl is needed to fetch FinMotion"

# Everything is fetched into a folder of its own first, so a download that fails leaves nothing behind.
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
for f in $FILES; do
  mkdir -p "$work/$(dirname "$f")"
  curl -fsSL "$SITE/finmotion/$f" -o "$work/$f" || fail "could not fetch $SITE/finmotion/$f"
done
mkdir -p "$dir"
cp -R "$work/." "$dir/"

printf 'FinMotion is in %s. Load %s/finmotion.css after FinUI'"'"'s stylesheets, and call motion() from %s/core/finmotion.js once.\n' "$dir" "$dir" "$dir"
