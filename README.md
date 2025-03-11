<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_Logo%20-%20IA%20Mistral.png" width="300" alt="FortiRule logo">
</p>

**FortiRule 🔥 - Easily manage blocking any external threat across all your FortiGate firewalls within a minute.**

[![Generic badge](https://img.shields.io/badge/Version-1.0.0-<COLOR>.svg)](https://github.com/choupit0/FortiRule/releases/tag/v1.0.0)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/choupit0/FortiRule/blob/master/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/choupit0/FortiRule/graphs/commit-activity)
[![made-with-bash](https://img.shields.io/badge/Made%20with-ChatGPT-1f425f.svg)](https://chat.openai.com/)

# 🌟 Description
FortiRule is a Node.js App to update plain text files used by [FortiGate Threat feeds connector](https://docs.fortinet.com/document/fortigate/7.0.1/administration-guide/9463/threat-feeds) to dynamically import an external block list from an HTTP server.

But also to authorize a website, domain, or any IPv4/IPv6 address.

Depending on your time interval to refresh the external resource configured (refresh rate), the applicable threat feed could be done within a minute (default = 5 minutes).

# ⚠️ Application development
> __Warning__
>
> This App was largely made with the help of [ChatGPT](https://chat.openai.com/) from OpenAI, based on GPT-3.5 model. NPM package.json file were audited with [AuditJS](https://github.com/sonatype-nexus-community/auditjs) and few security hardening was performed. But I'm not a full-time Node.js developer, so please be understanding ;) I have documented the code as best as I could.

# 🎯 Features
### Efficient File Management
- **Time-Saving**: Avoids the need to connect to the web server for file changes, reducing errors and saving time.
- **UTC Timestamping**: Automatically adds UTC timestamps when updating and formatting plain text files.
- **Content Viewing**: Easily view existing content and the latest additions in plain text files.

### Threat Management
- **Blocking and Unblocking**: Manage threats by blocking or unblocking sites using four dedicated text files.
- **Content Validation**:
  - Ensures no empty fields.
  - Validates IPv4/IPv6 addresses and URLs/domains for correct formatting.
  - Displays error messages for incorrect data or misplaced entries (e.g., no IPs in URL files).
  - Checks for and displays duplicate entries.

### Content Control
- **Pre-Insertion Checks**:
  - Requests confirmation before applying changes.
  - Ensures data integrity by validating content before insertion.
- **Post-Insertion Management**:
  - Creates files on-the-fly if they don't exist.
  - Concatenates new data with existing content.
  - Prevents duplicate entries and displays duplicate lines without applying changes.
  - Automatic backup and cleanup, retaining the last 5 versions of each file with UTC timestamps.

### Mobile Compatibility
- **Responsive Design**: The site is mobile-compatible, allowing for easy management and viewing on mobile devices.

<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_Mobile_Demo.png" width="512" alt="Web page">
</p>

On the server:

<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_Backend.png" width="512" alt="Backend">
</p>

# 🛠️ Prerequisites & Installation - FortiRule (http)
The FortiRule deployment has been validated on Ubuntu and Debian (latest versions of 64bits). But it should work on other Linux OS as well.

Your server needs to have internet access or access to a local mirror to install the packages.

Remember to open TCP ports 3000 (Node.js server) and 80 (Apache2, http) if there's a firewall between the client and the server.

As an example, here's the procedure to install it on a fresh Debian 12 (as root, and choose SSH + Web server modules during the OS installation):
```
apt update && apt upgrade
apt install nodejs npm -y
nodejs --version && npm --version
```
Now, clone the GitHub repository into the root directory of Apache2 (by default "/var/www/html/"):
```
cd /tmp/
git clone https://github.com/choupit0/FortiRule.git
cd FortiRule
mv fortirule/ /var/www/html/
```
Installation of NPM packages:
```
cd /var/www/html/fortirule/srv-nodejs
npm install express http fs fs-extra moment-timezone helmet
```
Provide the IP address or FQDN of your server hosting this Node.js application, line 80 from the Javascript file "/var/www/html/fortirule/js/script.js":
```
vi /var/www/html/fortirule/js/script.js
:%s/fqdn_or_ip/[Please, enter your server IP/FQDN here.]/
:wq
```
Launch the application:
```
/usr/bin/node /var/www/html/fortirule/srv-nodejs/server.js
```
The application is now accessible and fully functional from this URL:
```
http://[your server IP/FQDN]/fortirule/
```
# 🔧 Prerequisites & Configuration - FortiGate
## External Connectors - Threat Feeds

To use the plain text files generated by FortiRule, you need to create a new External Connector and then choose the Threat Feeds connector (One connector per file type).

An example here with the creation of the External Connectors from CLI (tested on FortiOS 6.4, 7.0, 7.2, and 7.4):
```
config system external-resource
    edit "IP-To-Block"
        set type address
        set resource "http://[your server IP/FQDN]/fortirule/files/IP-To-Block.txt"
        set refresh-rate 1
    next
    edit "IP-To-Authorize"
        set type address
        set resource "http://[your server IP/FQDN]/fortirule/files/IP-To-Authorize.txt"
        set refresh-rate 1
    next
    edit "URL-Category-To-Block"
        set category 192
        set resource "http://[your server IP/FQDN]/fortirule/files/URL-Category-To-Block.txt"
        set refresh-rate 1
    next
    edit "URL-Category-To-Authorize"
        set category 193
        set resource "http://[your server IP/FQDN]/fortirule/files/URL-Category-To-Authorize.txt"
        set refresh-rate 1
    next
end
```
I always create these connectors at the "Global" level to use them later in the VDOMs (```config global``` if you have multiple VDOMs), Ex. (```Global\Security Fabric\External Connectors\Threat Feeds```):

<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_TF_GUI.png" width="900" alt="FortiRule TF GUI">
</p>

## Firewall Policies
### Blocking incoming and outgoing traffic via IP filtering

Simply create a rule at the very top between your LAN|DMZ and WAN interfaces (and vice versa) to protect your web services and combat data leaks, command and control (C&C) servers, etc... Ex.:
```
config firewall policy
    edit 0
        set name "Block IP Threat-Feeds - LAN"
        set srcintf "internal"
        set dstintf "virtual-wan-link"
        set srcaddr "GRP_RFC1918"
        set dstaddr "g-IP-To-Block"
        set schedule "always"
        set service "ALL_ICMP_TCP_UDP"
        set logtraffic all
        set match-vip disable
    next
end
```
<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_Block_IP_TF_From_LAN.png" width="900" alt="FortiRule Block IP TF From LAN">
</p>

```
config firewall policy
    edit 0
        set name "Block IP Threat-Feeds - DMZ"
        set srcintf "virtual-wan-link"
        set dstintf "DMZ"
        set srcaddr "g-IP-To-Block"
        set dstaddr "VIP_WEBMAIL_ISP1" "VIP_WEBMAIL_ISP2" "VIP_SFTP "VIP_WEB_PRODUCTION"
        set schedule "always"
        set service "ALL_ICMP_TCP_UDP"
        set logtraffic all
        set match-vip disable
    next
end
```
<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_Block_IP_TF_From_WAN.png" width="900" alt="FortiRule Block IP TF From WAN.png">
</p>

### Allow important outgoing traffic (only) via IP filtering

It may be important to allow outgoing traffic (only) to certain hosts, such as to a SOC, Ex. (to be placed just below the blocking rule mentioned above):
```
config firewall policy
    edit 0
        set name "IP-To-Authorize - LAN"
        set srcintf "internal"
        set dstintf "virtual-wan-link"
        set action accept
        set srcaddr "GRP_RFC1918"
        set dstaddr "g-IP-To-Authorize"
        set schedule "always"
        set service "HTTP" "HTTPS" "PING"
        set logtraffic all
        set nat enable
    next
end
```
<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_Permit_IP_TF_From_LAN.png" width="900" alt="FortiRule Permit IP TF From LAN.png">
</p>

Note: It is generally advisable to avoid using traffic inspection, as SOCs often use SSL pinning.

### Blocking incoming and outgoing traffic via Domain/URL filtering
**To be continued...**

### Allow important outgoing traffic (only) via Domain/URL filtering
**To be continued...**

# Explanatory diagram
**To be continued...**

# 🔒 Enhance security
**We encrypt communications, we need to use the HTTPS protocol both at the application level and the Apache2 server level; otherwise, it won't work.**

## Apache2 (https):

Let's enable the SSL module for Apache and SSL site:
```
npm install https
a2enmod ssl
a2ensite default-ssl
```
For the exercise, we will use our own certificate without password (use your own issuing CA for added security and to avoid alerts):
```
cd /var/www/html/fortirule
mkdir -p ssl ssl/{cert,private}
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out self.crt
mv self.crt ssl/cert/ && mv private.key ssl/private/
```
Updating the Apache2 sites (Adding paths to the certificate and private key, and redirecting HTTP to HTTPS):
```
vi /etc/apache2/sites-available/default-ssl.conf
```
Uncomment and change the path of these two parameters, then save:
```
SSLCertificateFile      /var/www/html/fortirule/ssl/certs/self.crt
SSLCertificateKeyFile   /var/www/html/fortirule/ssl/private/private.key
:wq
```
Here, we add the directive that enforces the use of HTTPS (Please, provide the address of your server.):
```
vi /etc/apache2/sites-available/000-default.conf
Redirect permanent / https://[your server IP/FQDN]/
:wq
```
Then reload Apache2:
```
systemctl reload apache2
```
The application is now accessible from this new URL:
```
https://[your server IP/FQDN]/fortirule/
```
## Node.js (https):

Let's install the HTTPS module:
```
cd /var/www/html/fortirule/srv-nodejs
npm install https
```
We can now edit the second SSL server and add the path to the certificate and private key (lines 17 and 18) :
```
vi /var/www/html/fortirule/srv-nodejs/server-ssl.js
key: fs.readFileSync('/var/www/html/fortirule/ssl/private/private.key', 'utf8'),
cert: fs.readFileSync('/var/www/html/fortirule/ssl/certs/self.crt', 'utf8')
:wq
```
Launch the application:
```
/usr/bin/node /var/www/html/fortirule/srv-nodejs/server-ssl.js
```
The application is now accessible and fully functional from this new URL:
```
https://[your server IP/FQDN]/fortirule/
```
## Protect access to the website:
**We must protect access to the website as it could be disastrous for your company (in one way or another). We will implement "username/password" authentication to access the website from the FortiGate and for administration purposes.**

Let's create an .htpasswd file in the Apache2 directory (with ```root``` as the owner, permissions ```chown 600```):
```
htpasswd -c /etc/apache2/.htpasswd fortigate
[you password x2]
```
Continue with the .htaccess file to be placed at the root of the fortirule directory:
```
vi /var/www/html/fortirule/.htaccess
AuthType Basic
AuthName "FortiRule - Log in"
AuthUserFile /etc/apache2/.htpasswd
Require valid-user
:wq
```
You then simply need to adapt your configuration files, as shown here with one of them (and we use the ```https``` protocol this time):
```
config global
config system external-resource
    edit "IP-To-Block"
        set type address
        set username "fortigate"
        set password [your (.htpassword) password]
        set resource "https://[your server IP/FQDN]/fortirule/files/IP-To-Block.txt"
        set refresh-rate 1
    next
end
```
Next, ensure that your FortiGate devices are able to connect and authenticate successfully:

<p align="center">
  <img src="https://github.com/choupit0/FortiRule/blob/master/screenshots/FortiRule_TF_Ext_Connectors_Status.png" width="800" alt="FortiRule TF Ext Connectors Status.png">
</p>

## Dedicated user & group: fortirule
**To be continued...**

## Firewall:
**To be continued...**

# 🚀 Take the application further

## Automatic startup of the application using systemd:

We create a new service:
```
vi /etc/systemd/system/fortirule.service
```
And add this content, save and exit Vi:
```
[Service]
Environment=NODE_ENV=production
Environment=NODE_PORT=3000
WorkingDirectory=/var/www/html/fortirule/srv-nodejs
ExecStart=/usr/bin/node /var/www/html/fortirule/srv-nodejs/server-ssl.js
Restart=always

[Install]
WantedBy=multi-user.target
:wq
```
Applying changes, enabling the service, and then starting the application:
```
systemctl daemon-reload
systemctl enable fortirule.service
systemctl start fortirule
```
To check the status of the service and/or the content of the service:
```
systemctl status fortirule
systemctl cat fortirule
```
**To be continued...**

# ⚠️ What the application does not do
> __Note__
>
> Currently, it's not possible to delete data within the files. And there's no file to handle the hash of malware, the fourth type of threat feeds.

# ✅ To Do
- Enhance security and better filter/control server-side input data.
- Enhance the README with examples and information on security hardening.
- Plan for a Docker version of the application.
- Be able to delete lines in files (?).
- Add/display information regarding file size limits (provide a percentage).

