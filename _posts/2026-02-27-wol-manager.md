---
layout: post
title:  'WOL Manager'
date:   2026-02-27 15:03:25 -0400
tags: bash
---
I needed an easy script to turn Wake On Lan on. I then decided to expand it into a manager script.

### Wake On Lan Fails On Ubuntu

For my Dell XPS, the Wake On Lan feature always worked on Windows. I changed my desktop computer to Ubuntu and the Wake On Lan no longer works. The problem is actually in the driver that the maintainer apparently never fixes the WOL issue despite the many complaints. I found a fix for the driver but here is the script I was trying to use before the driver patching.

### Usage
The script is called wol-manager.sh  
The script, of course, has to be made executable like this...
```bash
chmod +x ./wol-manager.sh
```

The default for the script is to simply display an interactive terminal menu...
```bash
./wol-manager.sh
❌ Error: Use sudo.

sudo ./wol-manager.sh

--- WOL MANAGER ---
Select NICs to ENABLE WoL. Unselected will be DISABLED.
------------------------------------------------------------
Controls: [W/S] Up/Down, [SPACE] Toggle, [ENTER] Apply & Save
------------------------------------------------------------
    [X] ENABLE  lan   (Current: Enabled)
 >  [X] ENABLE  wifi  (Current: Disabled)
------------------------------------------------------------

Applying changes:
 [+] Enabling WoL on: lan
 [+] Enabling WoL on: wifi

✅ All changes applied successfully!
```

Because I typically just want all NICs enabled there is a parameter '-a'...
```bash
sudo ./wol-manager.sh -a

Applying changes:
 [+] Enabling WoL on: enp4s0
 [+] Enabling WoL on: wlp3s0

✅ All changes applied successfully!
```

[Github Wol-Manager](https://github.com/irtheman/coding/blob/master/bash/wol-manager.sh)
