/* test page */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/', async(req, res, next) => {

  console.log(encodeURI('😉'));
  console.log(decodeURI(encodeURI('😉')));
});

module.exports = router;
