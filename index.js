const express = require('express');
const { UAParser } = require('ua-parser-js');

const app = express();
const port = 5001;
const IPINFO_API_KEY = '01e746c9df49ad';

const fetchFetch = async () => {
    const { default: fetch } = await import('node-fetch');
    return fetch;
};

app.get('/user-agent-info', async (req, res) => {
    const parser = new UAParser();
    const userAgent = req.get('User-Agent');
    const uaResult = parser.setUA(userAgent).getResult();

    const requestIp = req.ip
console.log("requestIp", requestIp)

    let ip = req.headers['x-forwarded-for'];
    console.log("ippppppp", ip)

    if (!ip || ip === '::1' || ip === '127.0.0.1') {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            ip = data.ip;
            console.log("Fetched IP:", ip);
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
