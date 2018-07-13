/* test page */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.post('/', async(req, res, next) => {

  // console.log(encodeURI('😉'));
  // console.log(decodeURI(encodeURI('😉')));

  // var currentTime = new Date();
  // currentTime = currentTime.toLocaleDateString() + "_" + currentTime.toLocaleTimeString();
  // console.log(currentTime);

  // var a = 123;
  // var b = "4567";
  // var c = new Array();

  // console.log(typeof(a), typeof(b))
  // console.log(typeof(new Array()))
  // console.log(c)

  console.log((req.body.content).substr(1, (req.body.content).length-2))


});

module.exports = router;
