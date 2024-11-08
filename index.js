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

    // Retrieve client IP address, accounting for proxies
    // let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ip = req.ip
    ip = ip.split(',')[0].trim();
    console.log("Initial IP:", ip);

    // Local testing check: fetch public IP if IP is localhost
    if (ip === '::1' || ip === '127.0.0.1') {
        try {
            const fetch = await fetchFetch();
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            ip = data.ip;
            console.log("Fetched Public IP:", ip);
        } catch (error) {
            return res.status(500).json({ error: 'Could not retrieve public IP' });
        }
    }

    // Fetch location data from ipinfo.io
    let locationData = {};
    try {
        const fetch = await fetchFetch();
        const locationResponse = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_API_KEY}`);
        locationData = await locationResponse.json();
    } catch (error) {
        console.error('Error fetching location data:', error);
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
