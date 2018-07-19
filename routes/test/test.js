/* test page */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const errors = require('../../errors');

router.get('/', async(req, res, next) => {
  return next(404);
});

module.exports = router;
