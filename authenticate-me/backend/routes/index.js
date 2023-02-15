const express = require('express');
const app = require('../app');
const router = express.Router();

app.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();

  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({'XSFR-Token': csrfToken});
});

module.exports = router;
