---
layout: post
title:  'Namecheap DDNS'
date:   2022-01-28 14:03:25 -0400
tags: bash
---
Keeping my NameCheap DDNS IPs updated.

# NameCheap

Some of my domain names are registered with NameCheap. Like my other registrars, I often use DDNS but NameCheap is a lot more difficult to keep the IP addresses up to date. Rather than use their provided application I made my own a long time ago because it was a fun challenge but I've decided to share my DDNS IP address updating script.

As a note, I also have been using an Asus router for many years now. They provide their own DDNS service with their own provider domain named 'asuscomm.com'. It does come with it's own SSL certificate also. You get to choose your own subdomain. As an example, mine could be 'asus-ddns-subdomain' giving me a final url like 'asus-ddns-subdomain.asuscomm.com'. My 'asus-ddns-subdomain.asuscomm.com' url has the IP address assigned by my internet provider and Asus keeps it up to date. This is so very useful in a huge variety of ways which is one of several reasons I still use an Asus router.

### DDNS.sh Script
The script I'm using is named ddns.sh and I keep it in my docker folder at /svr/docker so it is easy to find and edit when needed. This script will require the use of CRON but it will mostly only be run very quickly without sending any data back to NameCheap unless it becomes necessary.

### Disable Echo
First I wanted to be able to turn echo off when it isn't needed. I'm using the environment variable CRON as a flag to turn echo off. For echo, I'm using a variable that starts with the ***echo*** command and, if the CRON environment variable is there, the variable changes to ":" which just means "don't do anything".

```bash
echo="echo"
if [ ! -z "$CRON" ]; then
  echo=":"
fi
```

### Domains and Subdomains
The next step is to create two arrays, one for the root domains and the other for the subdomains. This has actually made it pretty easy to add new domains or subdomains and the CRON job doesn't even have to be restarted.

Each array index is the root domain. On NameCheap, every domain has it's own API Access Key for updating the IP address which is why the need for them to be included here.

Every subdomain, indexed by their own root domain, is also provided here in the script. For NameCheap, the subdomains don't know the root domain's IP address so they need to be set individually. Each subdomain here is separated by a '\|'.

Please note, every subdomains element starts with '@'. This is the reference to the root domain itself. If you are using this script and have a domain that doesn't have any subdomains, like 'domain6.tld', then you still need to provide the API key, of course, and the subdomains entry must, at the very least, have the '@' listed and, in this case, no '\|' will be needed.

```bash
declare -A domains
declare -A subdomains

domains["domain4.tld"]="random-namecheap-api-key-one"
domains["domain5.tld"]="random-namecheap-api-key-two"
domains["domain3.tld"]="random-namecheap-api-key-three"
domains["domain6.tld"]="random-namecheap-api-key-four"

subdomains["domain4.tld"]="@|www.|immich.|nextcloud.|collabora."
subdomains["domain5.tld"]="@|www."
subdomains["domain3.tld"]="@|www."
subdomains["domain6.tld"]="@"
```

### IP Address Found
From here, the script needs to know what the currently assigned IP address is. Well, the script will be using the Asus provided url. The host command gives us a break down of the url provided. Grep find the 'has address' part. Awk extracts the IP address. The IP address is then assigned to the local_ip variable.

```bash
ddns="asus-ddns-subdomain.asuscomm.com"
local_ip=$(host -t a $ddns | grep "has address" | awk '{print $4}')
$echo "Local IP: $local_ip"
```

### Iterating Over The Domains
We need to report the new IP address to NameCheap for every root domain. The '!' is saying to return the keys of each element of the array. The script will go through every root domain like this...

```bash
for domain in "${!domains[@]}"; do
...
done
```

### Iterating Over Subdomains
For each root domain we also need to report the new IP address to NameCheap for every subdomain.
The script continues by getting the subdomains and splitting them up into an array called 'hosts' using the bash 'declare -a' operation. The script can then iterate over the subdomains even if it is just an '@'.

```bash
for domain in "${!domains[@]}"; do
  str=${subdomains[$domain]}
  IFS='|'
  declare -a hosts=($str)

  for host in "${hosts[@]}"; do
  ...
  done
done
```

### Authoritative Name Servers
The script needs to determine the authoritative name server for each subdomain as we will be asking that name server what the current IP address is for that subdomain.

Here, if the subdomain, represented as host, is empty then it will be given and '@' just in case. The actual ***host*** command is used to find the name server for the subdomain. The result has a lot of information so 'grep' looks for the name server part. Just in case there is more than one name server listed the ***head*** command gets the first one. The ***awk*** command then returns the name server's name.

```bash
hst="${host//@/}"
authoritative_nameservers=$(host -t ns $hst$domain | grep "name server" | head -n1 | awk '{print $4}')

$echo "Authoritative nameserver for $hst$domain: $authoritative_nameservers"
```

### Subdomain IP Address
This seems silly to do things this way when we could just use something like 'host -t a $hst$domain' but, in this situation, it is best to get the IP address from the authoritative name server. The ***dig*** command is the best way I could find at the time for this purpose.

```bash
resolved_ip=$(dig +short @$authoritative_nameservers $hst$domain)

$echo "Resolved IP for $hst$domain: $resolved_ip"
```

### Do We Need To Anything?
At this point, we can compare the resolved IP address with the local IP address to determine if anything has changed.
Regardless of the solution, the subdomain and domain loops continue to their end.

```bash
if [ "$resolved_ip" = "$local_ip" ]; then
  $echo "$domain records are up to date!"
else
  ...
fi
```

### Update The NameCheap DDNS IP Address
If the resolved IP address does not match the local IP address then it is time to tell NameCheap DDNS that the IP address has changed for the current subdomain.

This is done by using their DDNS update API via the ***curl*** command. We provide the subdomain, or just an '@' if needed, the root domain, and the "password" that is actually the API Access Key.

```bash
response=$(curl -s "https://dynamicdns.park-your-domain.com/update?host=${host//./}&domain=$domain&password=${domains[$domain]}")
```

Checking the response from the NameCheap API, after trying to update the IP address, for errors is a big help.
This is best run independently outside of CRON so you can see any error message.

```bash
err_count=$(grep -oP "<ErrCount>\K.*(?=</ErrCount>)" <<<"$response")
err=$(grep -oP "<Err1>\K.*(?=</Err1>)" <<<"$response")

if [ "$err_count" = "0" ]; then
    $echo "API call successful! DNS propagation may take a few minutes..."
else
    echo "API call failed! Reason: $err"
fi
```

### CRON for DDNS.sh Script
CRON will run the script at short intervals watching for my internet service provider changing my IP address since they don't even tell me when it happens. I'm going to assume you know how to use CRON.

Running 'crontab -e' will prompt you to choose your editor if you haven't used it before.

Add the following line at the end of the crontab list of tasks. The task runs the ddns.sh script every 10 minutes from the top of the hour. You are free to adjust that timing as you want. I've seen people using 5 minute intervals, 1 hour intervals, and others. Including 'CRON=running', as described above, adds the CRON environment variable to the script telling it to not use echo.

```bash
0,10,20,30,40,50 * * * * CRON=running /svc/docker/ddns.sh
```

[Github ddns.sh](https://github.com/irtheman/coding/blob/e6c24ca507bcbc98e72d60bcf667f9700a6e99aa/bash/ddns.sh)

