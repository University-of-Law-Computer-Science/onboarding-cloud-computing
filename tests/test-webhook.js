/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");

// This script simulates a GitHub Actions webhook payload sending a grade
// It expects the Next.js server to be running on localhost:3000

const WEBHOOK_SECRET =
  "f3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0";
// const ENDPOINT = "http://localhost:3000/api/webhooks/grading";

// Payload mimicking what the autograding workflow sends
const payload = {
  repo: "user-repo-04-architecture",
  status: "success",
  grade: 85,
  feedback: "Great job! Architecture diagram is correct.",
  secret: WEBHOOK_SECRET,
  github_username: "testuser",
};

const payloadString = JSON.stringify(payload);

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/webhooks/grading",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payloadString.length,
  },
};

console.log("Sending test payload to webhook...");

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:", data);
    if (res.statusCode === 200 || res.statusCode === 404) {
      // 404 is expected if user not found in DB
      console.log("✅ Webhook endpoint is reachable and responding.");
    } else {
      console.log("❌ Webhook returned unexpected status.");
    }
  });
});

req.on("error", (error) => {
  console.error("Error sending request:", error.message);
  console.log("Make sure the Next.js server is running on localhost:3000");
});

req.write(payloadString);
req.end();
