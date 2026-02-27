#!/bin/bash

# Change these as needed
# SED_SCRIPT is the temporary sed script file
# SECRETS is the file containing patterns to search for
# EXD is a comma-separated list of directories to exclude
# EXEXT is a comma-separated list of file extensions to exclude
SED_SCRIPT="/tmpfs/script.sed"
SECRETS="/mnt/dev/private-patterns.txt"
EXD="venv,.git,.vscode"
EXEXT="gitignore,pdf"

usage() {
    echo "Usage: $0 [option] <directory>"
    echo "Options:"
    echo "  -s | --swap      Replace redacted with private"
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

set -f

# Build the exclude paths
path=""
IFS=',' read -r -a fld <<< "$EXD"
for d in "${fld[@]}"; do
  path="$path ! -path ""./${d}/*"""
done

# Build the exclude extensions
extension="\( "
IFS=',' read -r -a ext <<< "$EXEXT"
for e in "${ext[@]}"; do
  extension="$extension ! -iname "".${e}"""
done
extension+=" \)"

# Build the sed script from the secrets file
mapfile -t lines < $SECRETS
for line in "${lines[@]}"; do
  IFS='=' read -r -a array <<< "$line"

  if $swap; then
    escaped_lhs="${array[1]//[][\\\/.^\$*]/\\&}"
    escaped_rhs="${array[0]//[\\\/&$'\n']/\\&}"
  else
    escaped_lhs="${array[0]//[][\\\/.^\$*]/\\&}"
    escaped_rhs="${array[1]//[\\\/&$'\n']/\\&}"
  fi
  escaped_rhs="${escaped_rhs%\\$'\n'}"

  echo "s/${escaped_lhs}/${escaped_rhs}/g"
done > $SED_SCRIPT

# Find files, filter for ASCII, and apply the sed script
command="find $folder -type f $extension $path -print"
results=$(eval $command | xargs file | grep ASCII | cut -d: -f1)
readarray -t files <<< "$results"

for file in "${files[@]}"; do
   sed --in-place=.bku --file="$SED_SCRIPT" "$file"
   if ! cmp -s "$file" "$file.bku"; then
      echo "Modified $file"
   fi
   rm "$file.bku"
done

if [[ -f $SED_SCRIPT ]]; then
  rm $SED_SCRIPT
fi
