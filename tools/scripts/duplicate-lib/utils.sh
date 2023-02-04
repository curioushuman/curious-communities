#!/bin/zsh

# Renames direcories and files within a directory
# Usage: rename_items <directory> <old_string> <new_string>
rename_items() {
  if [[ $# -ne 3 ]]; then
    echo "Error: Incorrect number of arguments provided."
    echo "Usage: rename_items <directory> <old_string> <new_string>"
    return 1
  fi

  directory=$1
  old_string=$2
  new_string=$3

  find "$directory" -mindepth 1 -print0 | sort -zr | while IFS= read -r -d '' item; do
    base_dir=$(dirname "$item")
    file=$(basename "$item")
    if [[ "$file" == *"$old_string"* ]]; then
      new_file="${file/$old_string/$new_string}"
      new_item="$base_dir/$new_file"
      mv "$item" "$new_item"
    fi
  done
}
