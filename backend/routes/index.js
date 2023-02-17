const express = require('express');
const app = require('../app');
const router = express.Router();
const apiRouter = require('./api');

router.use('/api', apiRouter);

router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();

  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({'XSFR-Token': csrfToken});
});


module.exports = router;
