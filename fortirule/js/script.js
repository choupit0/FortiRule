document.getElementById('form').addEventListener('submit', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();

  const action = document.getElementById('action').value;
  const content = document.getElementById('content').value;
  const comment = document.getElementById('comment').value;

  // Check if all fields are filled
  if (!action || !content || !comment) {
    showMessage('Please fill in all fields.');
    return;
  }

  // Check the format of IPv4/IPv6 addresses, URLs/domains, and ensure there are no duplicates
  if (['Authorize_IP', 'Block_IP'].includes(action)) {
	const ipLines = content.split('\n');
	const duplicateIPs = findDuplicateIPs(ipLines);
	if (duplicateIPs.length > 0) {
	  showMessage(`The following IP addresses are duplicated: ${duplicateIPs.join(', ')}`);
	  return;
	}

	for (let i = 0; i < ipLines.length; i++) {
	  const ipLine = ipLines[i].trim();
	  if (!isValidIP(ipLine)) {
		showMessage(`The IP address format on line ${i + 1} is invalid. \nIPv4: Enter as e.g. 192.168.2.100, 172.31.0.0/16, or 172.16.8.1-172.16.8.100 \nIPv6: Enter as e.g. 2001:0db8::eade:27ff:fe04:9a01, 2001:0db8::eade:27ff:fe04:9a01/120 or 2001:0db8::eade:27ff:fe04:aa01-2001:0db8::eade:27ff:fe04:ab01`);
		return;
	  }
	}
	} else if (['Authorize_domain', 'Block_domain'].includes(action)) {
	  const domainLines = content.split('\n');
	  const duplicateDomains = findDuplicateDomains(domainLines);
	  if (duplicateDomains.length > 0) {
		showMessage(`The following domains/URLs are duplicated: ${duplicateDomains.join(', ')}`);
		return;
	  }

	  for (let i = 0; i < domainLines.length; i++) {
		const domain = domainLines[i].trim();
		if (isValidIP(domain)) {
		  showMessage(`The "${action}" action does not accept IP addresses. \nPlease enter URLs/domains only: http://example.com, http://example.com:8080, example.com, or *.example.com`);
		  return;
	  }
	}
  }

  // Check for invalid URLs or domain names for the "Authorize_domain" and "Block_domain" actions
  if (['Authorize_domain', 'Block_domain'].includes(action)) {
    const domainLines = content.split('\n');
    const invalidDomains = findInvalidDomains(domainLines);
    if (invalidDomains.length > 0) {
      showMessage(`The following domains/URLs are not valid: ${invalidDomains.join(', ')}`);
      return;
    }
  }

  // Display the confirmation dialog box
  const confirmed = confirm("Are you sure you want to make this change?");

  if (!confirmed) {
    showMessage('Change canceled.');
    return;
  }

  // Reset the fields
  document.getElementById('action').value = '';
  document.getElementById('content').value = '';
  document.getElementById('comment').value = '';

  // Send the data to the server
  const data = {
    action: action,
    content: content,
    comment: comment
  };

  // Provide the IP address or FQDN of the Node.js server
  fetch('http://fqdn_or_ip:3000/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        showMessage('Data saved successfully.');
      } else {
        response.text().then(errorMessage => {
          showMessage(errorMessage);
        });
      }
    })
    .catch(error => {
      showMessage('An error occurred while saving the data. \nPlease check if the service is started or the server is not behind a firewall.');
    });
}

function showMessage(message) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
}

function isValidIP(ip) {
  // Regular expression for validating both IPv4 and IPv6 addresses
  const ipPattern = /^((\d{1,3}\.){3}\d{1,3})$|^((\d{1,3}\.){3}\d{1,3}\/\d{1,2})$|^((\d{1,3}\.){3}\d{1,3}\-(\d{1,3}\.){3}\d{1,3})|^([a-fA-F0-9:]+\/[0-9]{1,3})$|^(([a-fA-F0-9:]+:+)+[a-fA-F0-9]+)-(([a-fA-F0-9:]+:+)+[a-fA-F0-9]+)$|^(([a-fA-F0-9:]+:+)+[a-fA-F0-9]+)$/;
  return ipPattern.test(ip);
}

function findDuplicateIPs(ips) {
  const ipSet = new Set();
  const duplicates = [];
  for (let i = 0; i < ips.length; i++) {
    const ip = ips[i].trim();
    if (ipSet.has(ip)) {
      duplicates.push(ip);
    } else {
      ipSet.add(ip);
    }
  }
  return duplicates;
}

function findDuplicateDomains(domains) {
  // Check if the domain name or URL is duplicate
  const domainSet = new Set();
  const duplicates = [];
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i].trim();
    if (domainSet.has(domain)) {
      duplicates.push(domain);
    } else {
      domainSet.add(domain);
    }
  }
  return duplicates;
}

function findInvalidDomains(domains) {
  // Check if the domain name or URL is invalid
  const invalidDomains = [];
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i].trim();
    if (!isValidDomain(domain)) {
      invalidDomains.push(domain);
    }
  }
  return invalidDomains;
}

function isValidDomain(domain) {
  // Regular expression for validating both URLs and FQDNs
  const domainPattern = /^(https?:\/\/)?((\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;
  return domainPattern.test(domain);
}
