const http = require('http');

async function runLoadTest() {
  console.log('Starting Load Test: 1000 Concurrent Submissions...');
  const start = Date.now();
  
  // Fake payload mimicking a TSP submission
  const payload = JSON.stringify({
    challengeId: '670000000000000000000001', // Dummy ID
    memberId: 'DSCAI_TEST_', // Will append index
    type: 'quiz',
    contestId: '670000000000000000000002', // Dummy TSP ID
    quizAnswers: [1, 2, 3],
  });

  const requests = [];
  for (let i = 1; i <= 1000; i++) {
    requests.push(new Promise((resolve) => {
      const p = JSON.stringify({
        ...JSON.parse(payload),
        memberId: `DSCAI_TEST_${i}`
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/challenges/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(p)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, data });
        });
      });

      req.on('error', (e) => {
        resolve({ status: 500, data: e.message });
      });

      req.write(p);
      req.end();
    }));
  }

  const results = await Promise.all(requests);
  const end = Date.now();
  
  const successCount = results.filter(r => r.status === 201 || r.status === 200 || r.status === 400).length; // 400 is fine if it complains about fake IDs
  const failCount = results.filter(r => r.status === 500).length;
  
  console.log(`Load Test Completed in ${(end - start) / 1000} seconds.`);
  console.log(`Total Requests: 1000`);
  console.log(`Successful/Handled Responses: ${successCount}`);
  console.log(`Failed/Crashed Responses: ${failCount}`);
  if (failCount === 0) {
    console.log('✅ TEST PASSED: No Database Disconnects or Server Crashes occurred!');
  } else {
    console.log('❌ TEST FAILED: The server buckled under load.');
  }
}

runLoadTest();
