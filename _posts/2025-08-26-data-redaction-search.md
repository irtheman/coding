---
layout: post
title:  'Data Redaction - Search'
date:   2025-08-26 15:02:25 -0400
tags: bash
---
Searching for private and redacted information in my repositories.

# Data Redaction Search Script

One of the things I like to do when it comes to data redaction for my repositories is to check for any private information. I have this bash script called 'search.sh' that will search the whole folder for any private information. The script can do the opposite as well, searching for redacted information.

Please take a look at [Data Redaction](https://blog.matthewhanna.net/data-redaction#private-information) for the 'private-information.txt' that will be used here.

**Sample run of search.sh**
```bash
# Bad run...
/scripts/search.sh
```

```
Usage: /scripts/search.sh [option] <directory>
Options:
  -s | --swap          Search for redacted
```

```bash
# Search for private information
/scripts/search.sh ./

# Search for redacted information
/scripts/search.sh -s ./
```

For this script, since my repositories are always the same layout I define some bash variables that are easy to update. Please excuse the bad naming; they've been there for years.

```bash
# SECRETS is the file containing patterns to search for
SECRETS="/private-information.txt"
# EXD is a comma-separated list of directories to exclude
EXD="--exclude-dir={venv,.git,.vscode}"
# EXEXT is a comma-separated list of file extensions to exclude
EXEXT="--exclude=*.{svg,webp,png,jpg,pdf,docx,gz,zip,tar}"
# TEMPFILE is where to store the altered private information
TEMPFILE="/tmpfs/temp-patterns.txt"
```

Next, the script loads all the lines for the 'private-information.txt' file and puts them in the TEMPFILE location.

```bash
# Read in all the private information and put it all in the lines array
mapfile -t lines < $SECRETS

# For each line in the lines array we are going to create the actual
# file that will be used for searching later.
for line in "${lines[@]}"; do
  # In the example 'private-information.txt' each private and redacted
  # are separated by an equal sign
  IFS='=' read -r -a array <<< "$line"

  # Swap decides if we will use redacted or private
  if $swap; then
    echo "${array[1]}"
  else
    echo "${array[0]}"
  fi
done > $TEMPFILE
SECRETS="$TEMPFILE"
```

Now, we just run the grep command and see what is in there...
```bash
# There were problems with string interpolation so the script uses eval on a string
# $folder is the script parameter for the folder to search
command="grep $EXD $EXEXT -RiIFn -f $SECRETS $folder"
eval $command
```

The end result of running this script is either nothing or the file name, line number, and the text that matches the private or redacted information being searched for. As for replacing private with redacted; see ya in the next post!

Post: [Replacing Redacted Data](https://blog.matthewhanna.net/data-redaction-replace)

[Github Search.sh](https://github.com/irtheman/coding/blob/6a326433b32770e2c749eabeaf5f460cb7ccc47b/bash/search.sh)