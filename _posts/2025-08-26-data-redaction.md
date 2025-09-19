---
layout: post
title:  'Data Redaction'
date:   2025-08-26 15:03:25 -0400
tags: bash git
---
Using data redaction on all my repositories.

# Data Redaction

The term for removing private information from code is data redaction. This technique involves masking or obscuring sensitive data within a document or dataset to protect personally identifiable information (PII) and other confidential data. Additionally, the process of hiding or removing sensitive information from documents is referred to as document redaction.

### Some Traditional Methods
Let's say we have a docker compose for a complex set of services or maybe a python program for running an AI model. We want to share the code but, we don't want to share our local information like the internal servers being used, their ports, the website domains, user names, passwords, contact information, or more.

I won’t bother explaining docker compose yaml files and their .env and secret files but they are the  best solutions. For docker compose one would use the .env and secret files that are then placed in the .gitignore file so they don’t get deployed. The .env, though in the .gitignore file, can be replaced with an uploadable example like 'example.env' so the one using the code can see what they need to provide. The same applies for the secret files, the secret file can have an uploadable replacement like ‘example.db_root_password.txt’. Documentation is very important.

For an application, like for python, one might use environment variables and document what they should look like so the one using the code can know what they need to complete. A simple script to launch the python application can include those environment variables like this but excluding the launching script using .gitignore...

```bash
#!/bin/bash
# File: launch.sh

GPU_BASE_URL=”MyPc1.local”
GPU_BASE_PORT=”5005”

python ./my-ai-script.py
```

```bash
# File: .gitignore
.env
secrets/
launch.sh
```

### My Custom Cover-All Redaction Method
I personally have been using a custom bash script that just goes through every folder and file in the repository replacing anything private with something else. The whole redaction process can be undone using the same script. All the private information is kept in a ‘private-information.txt’ file that is never in any repository. This way all the private information is in one place and before any commit, using a git pre-commit hook, everything gets redacted.

```bash
#!/bin/bash
# File: .git/hooks/pre-commit

count=$(/scripts/search.sh | wc -l)
if [ "$count" -gt 0 ]; then
  /scripts/replace.sh ../../
fi
```

The information used by search.sh and replace.sh is in the ‘private-information.txt’ file. All search and replace goes in the order of the longer string to be replaced down to the smaller string to be replaced so the longer one gets matched first.

One will notice that I am using an equal sign as a separator in this example. If one wants to use this script, just use a character not likely to be redacted like a whitespace or control character i.e. \r, \n, \v, etc

<a name="private-information"></a>
Here is an example of what the private-information.txt file would look like:

```
amigo.lan=MyPc1.local
hermano.lan=MyPc2.local
omigo=MyPc1
hermano=MyPc2
MySecretPassword1=<password>
MySecretPassword2=<Password>
MySecretPassword3=<Pwd>
MyUserName=<login>
me@mywebsite.net=user@domain.tld
contact@mywebsite.net=name@domain.tld
support@mywebsite.net=id@domain.tld
blog.mywebsite.net=sub.domain.tld
photos.mywebsite.net=immich.domain.tld
nc.mywebsite.net=nextcloud.domain.tld
mywebsite.net=domain.tld
```

Pretty simple, right? The whole point is to always cover anything that needs to be redacted with the ability to undo the redaction when needed. Let’s say one has all their repositories in one ‘repos’ folder. Every repository can then be kept redacted by running this script at any time.

What are these search and replace scripts I’m talking about? See ya in the next post!

Post: [Search For Redacted Data](https://blog.matthewhanna.net/data-redaction-search)
