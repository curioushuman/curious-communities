#!/bin/bash
# TODO: args version doesn't work, but is unnecessary
function getInput() {
  if test -n "$1"; then
    # output an arg if it's not empty
    echo $1;
  elif test ! -t 0; then
    # output the entire input
    cat;
  fi
}
strVal=$( getInput )
if [ ${#strVal} -gt 0 ]; then
echo $strVal;
exit;
else
echo "An error occurred";
exit 1;
fi
