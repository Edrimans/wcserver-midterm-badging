require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for shortened URLs
let urls = [];
let counter = 1;

// POST endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  try {
    const parsedUrl = new URL(originalUrl);

    // DNS lookup to ensure domain exists
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Check if already exists
        const existing = urls.find(item => item.original_url === originalUrl);
        if (existing) {
          return res.json(existing);
        }

        // Store new URL
        const shortUrl = counter++;
        const entry = { original_url: originalUrl, short_url: shortUrl };
        urls.push(entry);

        return res.json(entry);
      }
    });
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

// Redirect endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const entry = urls.find(item => item.short_url === short);

  if (entry) {
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
