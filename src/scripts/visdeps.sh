#!/usr/bin/env bash
mkdir .visdeps
dirs=(
  components
  constants
  context
  hooks
  lib
  pages
  solve
  utils
)
for dir in "${dirs[@]}"; do
  npx depcruise src --include-only "^src" --focus "^src/${dir}" --output-type dot | dot -T svg >".visdeps/${dir}.svg"
done
