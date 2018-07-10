/* test page */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/', async(req, res, next) => {

  var test = "update contents set thumbnail_url = 'https://myrubysbucket.s3.ap-northeast-2.amazonaws.com/legislator_profile/%EB%B0%94%EB%AF%B8%EB%8B%B9%20%ED%94%84%EB%A1%9C%ED%95%84_%EB%B0%94%EB%AF%B8%EB%8B%B9%20%EA%B9%80%EB%8F%99%EC%B2%A0.png'";
  var result = await db.queryParamCnt_Arr(test);
});

module.exports = router;
