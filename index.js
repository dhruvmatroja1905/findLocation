import express from 'express';
import fetch from 'node-fetch';
import { UAParser } from 'ua-parser-js';

const app = express();
const port = 5001;
const IPINFO_API_KEY = '01e746c9df49ad';

// Note: Do NOT set trust proxy to true if you want the closest proxy's IP
app.set('trust proxy', true);

app.use(function (req, res, next) {
    req.headers['x-real-ip'] = getUserIP(req);
    next();
  });
  
  
  function getUserIP(request) {
    let forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      if (forwardedFor.indexOf(',') > -1) {
        return forwardedFor.split(',')[0];
      } else {
        return forwardedFor;
      }
    } else {
      return request.socket.remoteAddress;
    }
  }

app.get('/user-agent-info', async (req, res) => {
    const parser = new UAParser();
    const userAgent = req.get('User-Agent');
    const uaResult = parser.setUA(userAgent).getResult();

    let ip = request.headers['x-real-ip']
    // let ip = req.ip
    console.log("ip", ip)
    
    if (ip && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    console.log("Processed IP:", ip);
    
    
    if (!ip || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168') ) {
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
