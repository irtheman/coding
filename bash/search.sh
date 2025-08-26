#!/bin/bash

# Change these as needed
# SECRETS is the file containing patterns to search for
# EXD is a comma-separated list of directories to exclude
# EXEXT is a comma-separated list of file extensions to exclude
SECRETS="/mnt/dev/private-patterns.txt"
EXD="--exclude-dir={venv,.git,.vscode}"
EXEXT="--exclude=*.{png,jpg}"
TEMPFILE="/tmpfs/temp-patterns.txt"

usage() {
    echo "Usage: $0 [option] <directory>"
    echo "Options:"
    echo "  -s | --swap      Search for redacted information"
    exit 1
}

# Check if first argument is provided
if [[ -z "$1" ]]; then
    usage
fi

swap=false
folder="./babble-blah-blah"

if [[ "$1" == "-s" || "$1" == "--swap" ]]; then
    swap=true
    if [[ -z "$2" ]]; then
        usage
    fi
    folder="$2"
else
    folder="$1"
fi

# Check if the folder is a directory
if [[ ! -d "$folder" ]]; then
    echo "The argument '$folder' is NOT a directory."
    usage
fi

mapfile -t lines < $SECRETS
for line in "${lines[@]}"; do
  IFS='=' read -r -a array <<< "$line"
  if $swap; then
    echo "${array[1]}"
  else
    echo "${array[0]}"
  fi
done > $TEMPFILE
SECRETS="$TEMPFILE"

command="grep $EXD $EXEXT -RiIFn -f $SECRETS $folder"

# echo $command
eval $command

if [[ -f $TEMPFILE ]]; then
  rm $TEMPFILE
fi
