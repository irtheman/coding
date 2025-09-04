#!/bin/bash

# Add CRON=running before the script in cron command
# crontab -e
# 0,10,20,30,40,50 * * * * /svc/docker/ddns.sh

echo="echo"
if [ ! -z "$CRON" ]; then
  echo=":"
fi

declare -A domains
declare -A subdomains

domains["domain4.tld"]="random-namecheap-api-key-one"
domains["domain5.tld"]="random-namecheap-api-key-two"
domains["domain3.tld"]="random-namecheap-api-key-three"

subdomains["domain4.tld"]="@|www.|immich.|nextcloud.|collabora."
subdomains["domain5.tld"]="@|www."
subdomains["domain3.tld"]="@|www."

ddns="asus-ddns-subdomain.asuscomm.com"

local_ip=$(host -t a $ddns | grep "has address" | awk '{print $4}')

$echo "Local IP: $local_ip"

for domain in "${!domains[@]}"; do
  str=${subdomains[$domain]}
  IFS='|'
  declare -a hosts=($str)

  for host in "${hosts[@]}"; do
    $echo
    hst="${host//@/}"
    authoritative_nameservers=$(host -t ns $hst$domain | grep "name server" | head -n1 | awk '{print $4}')
  
    $echo "Authoritative nameserver for $hst$domain: $authoritative_nameservers"
  
    $echo
  
    resolved_ip=$(dig +short @$authoritative_nameservers $hst$domain)
  
    $echo "Resolved IP for $hst$domain: $resolved_ip"
  
    if [ "$resolved_ip" = "$local_ip" ]; then
        $echo "$domain records are up to date!"
    else
        $echo "$domain records are OUTDATED!"
        response=$(curl -s "https://dynamicdns.park-your-domain.com/update?host=${host//./}&domain=$domain&password=${domains[$domain]}")
  
        err_count=$(grep -oP "<ErrCount>\K.*(?=</ErrCount>)" <<<"$response")
        err=$(grep -oP "<Err1>\K.*(?=</Err1>)" <<<"$response")
  
        if [ "$err_count" = "0" ]; then
            $echo "API call successful! DNS propagation may take a few minutes..."
        else
            echo "API call failed! Reason: $err"
        fi
    fi
  done
done
