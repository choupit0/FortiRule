const express = require('express');
const https = require('https');
const fs = require('fs');
const fse = require('fs-extra');
const moment = require('moment-timezone');
const helmet = require("helmet");

const app = express();
const hostname = '0.0.0.0';
const port = 3000;

// Middleware to set security-related headers on our HTTP requests
app.use(helmet());

// Configuration of the path to the certificate and private key files - text-based
const options = {
  key: fs.readFileSync('/var/www/html/fortirule/ssl/private/your-private.key', 'utf8'),
  cert: fs.readFileSync('/var/www/html/fortirule/ssl/certs/your.crt', 'utf8')
};

// Middleware to enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Middleware to parse the request body
app.use(express.json());

// Entry point to save updates to the text file
app.post('/save', (req, res) => {
  // Retrieve the data sent in the request
  const { action, comment, content } = req.body;

  // Get the current date in UTC time
  const currentDate = moment().utc();

  // Example to get the current date in EST time
  // const currentDate = moment().tz('America/New_York');

  // Format the date in the "DDMMYYYY-HHmmss" format
  const formattedDate = currentDate.format('DDMMYYYY-HHmmss');

  // Determine the file name based on the chosen action
  let fileName = '';
  if (action === 'Authorize_IP') {
    fileName = 'IP-To-Authorize.txt';
  } else if (action === 'Authorize_domain') {
    fileName = 'URL-Category-To-Authorize.txt';
  } else if (action === 'Block_IP') {
    fileName = 'IP-To-Block.txt';
  } else if (action === 'Block_domain') {
    fileName = 'URL-Category-To-Block.txt';
  } else {
    // If no valid action is chosen, send an error response
    res.status(400).send("Invalid action. Please choose a valid action.");
    return;
  }

  // Check if the file already exists
  const pathToFiles = '/var/www/html/fortirule/files/';
  if (fs.existsSync(`${pathToFiles}${fileName}`)) {
    // Read the current content of the file.
    const fileContent = fs.readFileSync(`${pathToFiles}${fileName}`, 'utf8');

    // Check if the content already exists in the file (line by line)
    const newLines = content.split('\n');
    const existingLines = fileContent.split('\n');
    const duplicateLines = newLines.filter(line => existingLines.includes(line));

    if (duplicateLines.length > 0) {
      // Send a response indicating the duplicate lines
      const errorMessage = `The following lines already exist in the file: ${duplicateLines.join(', ')}`;
      res.status(400).send(errorMessage);
      return;
    }

    // Save a copy of the file in the "backups" directory
    saveBackup(fileName, formattedDate, pathToFiles);

    // If the file exists, read its current content
    const existingData = fs.readFileSync(`${pathToFiles}${fileName}`, 'utf8');

    // Concatenate the new data with the existing content
    const newData = existingData + '\n' + '# ' + `${formattedDate}` + ' ' + comment + '\n' + content;

    // Write the updated data to the file
    fs.writeFileSync(`${pathToFiles}${fileName}`, newData);
  } else {
    // If the file doesn't exist, create a new file with the data
    fs.writeFileSync(`${pathToFiles}${fileName}`, '# ' + `${formattedDate}` + ' ' + comment + '\n' + content);
  }

  // Send a response indicating that the save was successful
  res.sendStatus(200);
});

// Function to save a backup copy with history
function saveBackup(fileName, formattedDate, pathToFiles) {
  const backupPath = `${pathToFiles}backups/`;

  // Check if the backup directory exists
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath);
  }

  // Read the existing backup files in the directory
  const backupFiles = fs.readdirSync(backupPath).filter(file => file.startsWith(`${fileName}.backup`));

  // Delete backup files exceeding the limit of 5 versions
  if (backupFiles.length >= 5) {
    const oldestBackup = backupFiles[0];
    fs.unlinkSync(`${backupPath}${oldestBackup}`);
  }

  // Copy the original file to the "backups" directory with the new backup name
  const backupFileName = `${fileName}.backup.${formattedDate}`;
  fse.copySync(`${pathToFiles}${fileName}`, `${backupPath}${backupFileName}`);
}

// Creation of the HTTPS server
const server = https.createServer(options, app);

// HTTPS server accessible at this URL
server.listen(port, hostname, () => {
  console.log(`HTTPS server started on https://${hostname}:${port}`);
});

