/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config(); // Then .env

const ORG = "University-of-Law-Computer-Science";
const REPO = "ccds-lab-04-architecture";
const TOKEN = process.env.GH_ADMIN_TOKEN;

if (!TOKEN) {
    console.error("❌ No GH_ADMIN_TOKEN found in .env or .env.local");
    process.exit(1);
}

console.log(`Testing access to template: ${ORG}/${REPO}`);
console.log(`Using token: ${TOKEN.substring(0, 4)}...`);

const options = {
    hostname: 'api.github.com',
    path: `/repos/${ORG}/${REPO}`,
    headers: {
        'User-Agent': 'Node.js Test Script',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }
};

const req = https.get(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log("✅ Token works! Repo is visible.");
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            console.log(`Is Template? ${json.is_template}`);
            console.log(`Visibility: ${json.visibility}`);
        });

    } else {
        console.log("❌ Token failed or repo not found.");
        console.log("This means the GitHub Token in your .env file does not have permission to see this private repository.");
        console.log("Please regenerate a Personal Access Token (Classic) with 'repo' scope.");
    }
});

req.on('error', (e) => {
    console.error(e);
});
