require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 3000;

async function startAternosServer() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

    // Login
    await page.goto('https://aternos.org/accounts/', { waitUntil: 'networkidle2' });
    await page.type('#user', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

    const startButtonSelector = '#start'; // Start button
    await page.waitForSelector(startButtonSelector, { timeout: 10000 });

    const isDisabled = await page.$eval(startButtonSelector, btn => btn.disabled);
    if (!isDisabled) {
      await page.click(startButtonSelector);
    }

    await browser.close();
    return 'Server start initiated.';
  } catch (err) {
    await browser.close();
    console.error(err);
    throw new Error('Failed to start Aternos server.');
  }
}

app.get('/start-server', async (req, res) => {
  try {
    const msg = await startAternosServer();
    res.send(msg);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
