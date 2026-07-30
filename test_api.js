const http = require('http');

async function doFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log("1. Testing Registration...");
  const regRes = await doFetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "testuser_clean", password: "testpass123" })
  });
  console.log(`Status: ${regRes.status}, Body: ${regRes.body}`);

  console.log("\n2. Testing Login...");
  const loginRes = await doFetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "testuser_clean", password: "testpass123" })
  });
  console.log(`Status: ${loginRes.status}, Body: ${loginRes.body}`);
  
  if (loginRes.status !== 200) {
    console.error("Login failed, aborting rest of tests");
    return;
  }
  
  const token = JSON.parse(loginRes.body).token;
  
  console.log("\n3. Testing Search Proxy...");
  const searchRes = await doFetch('http://localhost:8080/api/search?query=coldplay&type=album', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Status: ${searchRes.status}, Result count: ${JSON.parse(searchRes.body).resultCount}`);

  console.log("\n4. Testing Library POST...");
  const postLib = await doFetch('http://localhost:8080/api/library', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      appleCatalogId: 12345,
      title: "Test Album",
      artistName: "Test Artist",
      genre: "Pop",
      releaseDate: "2024-01-01T00:00:00Z",
      trackCount: 10,
      artworkUrl: "http://example.com/art.jpg"
    })
  });
  console.log(`Status: ${postLib.status}, Body: ${postLib.body}`);
  const albumId = JSON.parse(postLib.body).id;

  console.log("\n5. Testing Library GET...");
  const getLib = await doFetch('http://localhost:8080/api/library', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Status: ${getLib.status}, Libraries: ${JSON.parse(getLib.body).length}`);

  console.log("\n6. Testing Library PUT...");
  const putLib = await doFetch(`http://localhost:8080/api/library/${albumId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      userRating: 5,
      userNotes: "Great album!"
    })
  });
  console.log(`Status: ${putLib.status}, Body: ${putLib.body}`);

  console.log("\n7. Testing Insights (AI Feature)...");
  const getInsights = await doFetch('http://localhost:8080/api/library/insights', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Status: ${getInsights.status}, Body: ${getInsights.body}`);
}

runTests().catch(console.error);
