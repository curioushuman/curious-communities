#!/bin/zsh

# NOTE: this is a WIP
# Just a wrapper for the rename_items function

# Include the rename_items() function
source ./utils.sh

# Call the rename_items function
rename_items $1 $2 $3
