const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=1&format=png&data=';

const websiteUrl = 'https://mainstreet-roofing.ca';
const businessUrl = 'https://www.google.com/maps/place/Mainstreet+Roofing+LTD/@49.1733696,-122.8789032,17z/data=!3m1!4b1!4m6!3m5!1s0x5485d926e7253047:0x100780c25baf8d7c!8m2!3d49.1733696!4d-122.8789032!16s%2Fg%2F11y_rv29jg?hl=en-GB&entry=ttu&g_ep=EgoyMDI2MDQwNS4wIKXMDSoASAFQAw%3D%3D';

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  try {
    const websiteDest = path.join(__dirname, 'public', 'qr_website.png');
    const businessDest = path.join(__dirname, 'public', 'qr_reviews.png');

    console.log('Downloading Website QR to', websiteDest);
    await downloadFile(`${baseUrl}${encodeURIComponent(websiteUrl)}`, websiteDest);
    
    console.log('Downloading Business QR to', businessDest);
    await downloadFile(`${baseUrl}${encodeURIComponent(businessUrl)}`, businessDest);

    console.log('Successfully generated and updated both QR codes!');
  } catch (error) {
    console.error('Failed to generate QRs:', error);
  }
}

main();
