import express from 'express';
import fetch from 'node-fetch';
import { UAParser } from 'ua-parser-js';

const app = express();
const port = 5001;
const IPINFO_API_KEY = '01e746c9df49ad';

app.get('/user-agent-info', async (req, res) => {
    const parser = new UAParser();
    const userAgent = req.get('User-Agent');
    const uaResult = parser.setUA(userAgent).getResult();

    const requestIp = req.ip
console.log("requestIp", requestIp)

let ip = request.headers['x-forwarded-for'] || request.headers['cf-connecting-ip'] || request.headers['x-real-ip'] || request.ip;
// let ip = req.ip
console.log("ippppp", ip)
 // ip = ip.split(',')[0].trim(); 
// console.log("split IP", ip);
if (ip && ip.includes(',')) {
  ip = ip.split(',')[0].trim();
}
console.log("Processed IP:", ip);


if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168') || ip.startsWith('172.16')) {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ip = data.ip;
    console.log("Fetched public IP:", ip);
  } catch (error) {
    console.error('Could not retrieve public IP:', error);
    return { error: 'IP retrieval failed' };
  }
}

  let locationData = {}; 

  if (ip) {
    try {
        const locationResponse = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_API_KEY}`);
        locationData = await locationResponse.json();
        console.log("Location data:", locationData);
    } catch (error) {
        console.error('Error fetching location data:', error);
    }
  } else {
    console.error('No valid IP available for location lookup');
  }


    res.json({
        ip,
        location: locationData,
        deviceInfo: uaResult
    });
});

app.listen(port, () => {
    console.log(`User Agent API listening at http://localhost:${port}/user-agent-info`);
});
