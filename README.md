# FortiRule
[![Generic badge](https://img.shields.io/badge/Version-1.0.0-<COLOR>.svg)](https://github.com/choupit0/MassVulScan/releases/tag/v1.9.2)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/choupit0/FortiRule/blob/main/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/choupit0/FortiRule/graphs/commit-activity)
[![made-with-bash](https://img.shields.io/badge/Made%20with-ChatGPT-1f425f.svg)](https://chat.openai.com/)

**Easily manage blocking any external threat across all your FortiGate firewalls within a minute.**
# Description
FortiRule is a Node.js App to update TXT files used by FortiGate Threat feeds connector to dynamically import an external block list from an HTTP server.

But also to authorize a website, domain, or any IPv4/IPv6 address.

Depending on your time interval to refresh the external resource configured (refresh rate), the applicable threat feed could be done within a minute (default = 5 minutes).

# Application development
This App was largely made with the help of ChatGPT from OpenAI, based on GPT-3.5 model. Of course, there was a code review afterward and security hardening was performed. But I'm not a full-time Node.js developer, so please be understanding ;) I have documented the code as best as I could.

# Features
- Updating and formatting text files (adding only)
- Viewing text files (existing content and latest addition)
- 4 text files to manage blocking threats or unblocking sites
- Content control before insertion:
  - no empty fields,
  - ensure that IPv4/IPv6 addresses & URLs/domains are in the correct format (a message displays the lines with errors.),
  - ensure that we have the correct data in the right file (e.g., no IPs in a file meant for URLs),
  - check for duplicates (a message displays the duplicates lines).
- Request for confirmation before making the change
- Content control after insertion:
  - creating files on-the-fly if they don't exist,
  - concatenate the new data with the existing content,
  - check for duplicates (no changes are applied, a message displays the duplicates lines),
  - automatic backup and cleanup function (retain the last 5 versions of each file with timestamping).

# Prerequisites & Installation - FortiRule (http)
The FortiRule deployment has been validated on Ubuntu and Debian (latest versions of 64bits). But it should work on other Linux OS as well.

Your server needs to have internet access or access to a local mirror to install the packages.

As an example, here's the procedure to install it on a fresh Debian 12 (root):
(and choose SSH + Web server modules during the OS installation)
```
apt update && apt upgrade
apt install nodejs npm -y
nodejs --version && npm --version
```
Now, clone the GitHub repository into the root directory of Apache2 (by default "/var/www/html/"):
```
cd /var/www/html/
git clone https://github.com/choupit0/FortiRule.git
```
Installation of NPM packages:
```
cd /var/www/html/fortirule/srv-nodejs
npm install express http fs fs-extra moment-timezone helmet

```
Provide the IP address or FQDN of your server hosting this Node.js application:

Line 80 from the Javascript file "/var/www/html/fortirule/js/script.js".
```
vi /var/www/html/fortirule/js/script.js
:%s/fqdn_or_ip/[Please, enter your server IP/FQDN here.]/
:wq
```
Launch the application:
```
/usr/bin/node /var/www/html/fortirule/srv-nodejs/server.js
```

# Prerequisites & Configuration - FortiGate

# Enhance security - FortiRule (https)

# Take the application further

# What the application does not do
Currently, it's not possible to delete data within the files. And there's no file to handle the hash of malware, the fourth type of threat feeds.

