# FortiRule
[![Generic badge](https://img.shields.io/badge/Version-1.0.0-<COLOR>.svg)](https://github.com/choupit0/MassVulScan/releases/tag/v1.9.2)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/choupit0/FortiRule/blob/main/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/choupit0/FortiRule/graphs/commit-activity)
[![made-with-bash](https://img.shields.io/badge/Made%20with-ChatGPT-1f425f.svg)](https://chat.openai.com/)

**Easily manage blocking any external threat across all your FortiGate firewalls within a minute.**
# Description
FortiRule is a Node.js App to update TXT files used by FortiGate Threat feeds connector to dynamically import an external block list from an HTTP server.

But also to authorize a website, domain, or any IP address.

Depending on your time interval to refresh the external resource configured (refresh rate), the applicable threat feed could be done within a minute (default = 5 minutes).

# Application development
This App was largely made with the help of ChatGPT from OpenAI, based on GPT-3.5 model. Of course, there was a code review afterward and security hardening was performed. But I'm not a full-time Node.js developer, so please be understanding ;) I have documented the code as best as I could.

# Features
- Updating and formatting text files (adding only)
- Viewing text files (existing content and latest addition)
- 4 text files to manage blocking threats or unblocking sites
- 

# Prerequisites
