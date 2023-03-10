#!/bin/zsh

# Renames direcories and files within a directory
# Usage: rename_items <directory> <old_string> <new_string>
diagram() {
  if [[ $# -ne 1 ]]; then
    echo "Error: Incorrect number of arguments provided."
    echo "Usage: diagram <path_to_diagram_py_files>"
    return 1
  fi

  directory=$1

  # This will output the PNG files to the root directory
  # Doing it otherwise proved... Tricky/complicated
  for script in "$directory"/*.py; do
    pipenv run python "$script"
  done

  # Move the PNG files to the directory
  for img in *.png; do
    mv "$img" "$directory"/"$img"
  done
}

diagram $1
