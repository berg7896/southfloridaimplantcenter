const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.startsWith('all-on-4-') && f.endsWith('-landing-page.html'));
console.log('Found files:', files);

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  
  if (html.includes('getGclid')) {
    console.log(file + ' — already has GCLID, skipping');
    return;
  }

  const gclidCode = `

// GCLID Capture — grabs ?gclid= from URL, stores in cookie for 90 days
(function() {
  const params = new URLSearchParams(window.location.search);
  const gclid = params.get('gclid');
  if (gclid) {
    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = 'gclid=' + gclid + '; expires=' + expires + '; path=/';
  }
})();

function getGclid() {
  const match = document.cookie.match('(^|;)\\\\s*gclid=([^;]+)');
  return match ? match[2] : '';
}`;

  html = html.replace(
    /(const GHL_WEBHOOK_URL = ['"][^'"]+['"];)/,
    '$1' + gclidCode
  );

  html = html.replace(
    /source: 'South Florida Implant Center Landing Page',\s*\n\s*page: window\.location\.href/g,
    "source: 'South Florida Implant Center Landing Page',\n    page: window.location.href,\n    gclid: getGclid()"
  );

  fs.writeFileSync(file, html, 'utf8');
  console.log(file + ' — GCLID added ✅');
});
