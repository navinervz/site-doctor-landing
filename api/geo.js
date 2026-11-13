// Returns only the visitor's country code, as detected by the hosting edge (no third-party geo-IP call,
// nothing is stored or logged). Used by the landing page to *suggest* a language.
module.exports = function handler(req, res) {
  var country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase().slice(0, 2);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify({ country: /^[A-Z]{2}$/.test(country) ? country : '' }));
};
