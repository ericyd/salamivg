#!/bin/sh

from=$1
to=$2

if [ "$from" == "" ]; then
  from=$(git describe --abbrev=0 $(git describe --abbrev=0)^)
  echo "No 'from' positional arg provided. Defaulting to '$from'"
fi

if [ "$to" == "" ]; then
  to=$(git describe --abbrev=0)
  echo "No 'to' positional arg provided. Defaulting to '$to'"
fi

echo "\nChangelog from $from to $to\n"

# Some formatting explanations:
#   %h: short sha
#   %ad: author date, using --date option for format
#   %s: "subject" (probably the first line of the commit message, but haven't tested extensively)
#   %an: author name
#   %d: ref name; prints stuff like "(HEAD -> main, tag: v0.4.0, origin/main, origin/HEAD)"
git log \
  --abbrev-commit \
  --decorate \
  --date=short \
  --format=format:'* %s (%ad, [%h](https://github.com/ericyd/salamivg/commit/%H))' \
  "$from"..."$to"

# a nice one-liner that shows most of the useful info
# git log --abbrev-commit --decorate --date=short --format=format:'%h, %aI - %s %d' --all "$from"..."$to"