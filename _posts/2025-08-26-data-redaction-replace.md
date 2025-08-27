---
layout: post
title:  'Data Redaction - Replace'
date:   2025-08-26 15:01:25 -0400
tags: bash
---
Replacing private or redacted information in my repositories.

# Data Redaction Replace Script

It's time to take a look at the script that will replace the private information with the redacted information. The same script can undo that switch of information making it very convenient when storing code on a remote repository without making it private. This bash script is called 'replace.sh' and it will search the whole folder for any private information replacing it with the redacted version.

Please take a look at [Data Redaction](https://blog.matthewhanna.net/data-redaction#private-information) for the 'private-information.txt' that will be used here.

**Sample run of search.sh**
```bash
# Bad run...
/scripts/replace.sh
```

```
Usage: /scripts/replace.sh [option] <directory>
Options:
  -s | --swap          Replace redacted with private
```

```bash
# Replace for private information with a redacted version
/scripts/replace.sh ./

# Replace the redacted version with original private information
/scripts/replace.sh -s ./
```

For this script, I'm adding a bash variable while the others are just like in search.sh. They are easy to update this way. Again, please excuse the bad naming; they've been there for years.

```bash
# SECRETS is the file containing patterns to search for
SECRETS="/private-information.txt"
# EXD is a comma-separated list of directories to exclude
EXD="--exclude-dir={venv,.git,.vscode}"
# EXEXT is a comma-separated list of file extensions to exclude
EXEXT="--exclude=*.{svg,webp,png,jpg,pdf,docx,gz,zip,tar}"
# SED_SCRIPT is the temporary sed script file
SED_SCRIPT="/tmpfs/script.sed"
```

This script uses the find command so we need to add the parameters to exclude the chosen directories and file extensions. I think it makes things easier to store the directories and file extensions to exclude in variables and then just generate what is needed for the find command.

This find command will be used like this...
```bash
find ./folder -type f \( ! -iname ".png" ! -iname ".zip" \) ! -path "./venv" ! -path "./.git" -print
```

To generate the directories to be excluded the following script is used:
```bash
# Build the exclude paths
path=""
IFS=',' read -r -a fld <<< "$EXD"
for d in "${fld[@]}"; do
  path="$path ! -path ""./${d}/*"""
done
```

To generate the file extensions to be excluded the following script is then used:
```bash
# Build the exclude extensions
extension="\( "
IFS=',' read -r -a ext <<< "$EXEXT"
for e in "${ext[@]}"; do
  extension="$extension ! -iname "".${e}"""
done
extension+=" \)"
```

This script also is going to use the sed command. Using the sed script file is best in this situation but the file has to be generated. The sed command will make changes directly to the target file while making a backup before making that change.

The sed command will be used like this...
```bash
# SED script file is, per line, like this...
# s/SEARCH/REPLACE/g

sed --in-place=.bak --file=/tmpfs/script.sed this-file.txt
```

To generate the SED script file we have to read the 'private-information.txt' and transform it taking into consideration the swap parameter. SED does not do non-regex substitutions so there will be escaping added for both private and redacted.

```bash
# Build the sed script from the secrets file
mapfile -t lines < $SECRETS

for line in "${lines[@]}"; do
  IFS='=' read -r -a array <<< "$line"

  # Swapped or not all entries must be escaped
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
```

Next, we just need to get the list of files that can be modified...
```bash
# Find files, filter for ASCII, and create an array of files
command="find $folder -type f $extension $path -print"
results=$(eval $command | xargs file | grep ASCII | cut -d: -f1)
readarray -t files <<< "$results"
```

With the list of files that can be modified we will now apply the SED Script file to each of them.
```bash
for file in "${files[@]}"; do
   sed --in-place=.bku --file="$SED_SCRIPT" "$file"

   # Check if the file was actually modified by sed
   if ! cmp -s "$file" "$file.bak"; then
      # State which file was modified by sed
      echo "Modified $file"
   fi

   # Remove the backup copies
   rm "$file.bak"
done
```

And that is it. I put both search.sh and replace.sh in a git pre-commit hook. These files only need to be changed when there is a new type of folder or file type to ignore when replacing private and redacted information.

[Github Replace.sh](https://github.com/irtheman/coding/blob/6a326433b32770e2c749eabeaf5f460cb7ccc47b/bash/replace.sh)

