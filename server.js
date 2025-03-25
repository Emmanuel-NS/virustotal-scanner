const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to scan URL
app.post('/api/scan', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is not configured' });
    }
    
    console.log(`Scanning URL: ${url}`);
    
    // 1. Submit URL for scanning
    const encodedUrl = encodeURIComponent(url);
    const submitResponse = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      `url=${encodedUrl}`,
      {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const analysisId = submitResponse.data.data.id;
    console.log(`Analysis ID: ${analysisId}`);
    
    // 2. Poll for analysis results (with retries)
    let analysisComplete = false;
    let attempts = 0;
    let analysisResponse;
    
    while (!analysisComplete && attempts < 5) {
      attempts++;
      console.log(`Fetching results attempt #${attempts}`);
      
      try {
        analysisResponse = await axios.get(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          {
            headers: {
              'x-apikey': apiKey
            }
          }
        );
        
        const status = analysisResponse.data.data.attributes.status;
        console.log(`Analysis status: ${status}`);
        
        if (status === 'completed') {
          analysisComplete = true;
        } else {
          // Wait 2 seconds before trying again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (pollError) {
        console.error(`Error polling results: ${pollError.message}`);
        if (attempts >= 5) throw pollError;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!analysisComplete) {
      // Try to get URL report directly as fallback
      console.log("Analysis didn't complete in time, trying direct URL lookup");
      const urlId = Buffer.from(url).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      try {
        const urlInfoResponse = await axios.get(
          `https://www.virustotal.com/api/v3/urls/${urlId}`,
          {
            headers: {
              'x-apikey': apiKey
            }
          }
        );
        
        return res.json(urlInfoResponse.data);
      } catch (urlError) {
        console.error(`Error getting URL info: ${urlError.message}`);
        if (analysisResponse) {
          return res.json(analysisResponse.data);
        } else {
          throw new Error("Failed to get analysis results");
        }
      }
    }
    
    console.log("Sending analysis results to client");
    res.json(analysisResponse.data);
    
  } catch (error) {
    console.error('Error in scan endpoint:', error.message);
    
    let errorMessage = 'Error scanning URL';
    let statusCode = 500;
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
      
      if (error.response.status === 401) {
        errorMessage = 'Invalid API key';
        statusCode = 401;
      } else if (error.response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
        statusCode = 429;
      }
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.response?.data || error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});