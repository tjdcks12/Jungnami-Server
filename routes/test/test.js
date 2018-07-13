/* test page */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/', async(req, res, next) => {

  // console.log(encodeURI('😉'));
  // console.log(decodeURI(encodeURI('😉')));

  var currentTime = new Date();
  currentTime = currentTime.toLocaleDateString() + "_" + currentTime.toLocaleTimeString();
  console.log(currentTime);

});

module.exports = router;
