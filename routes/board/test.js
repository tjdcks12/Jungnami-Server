//test

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/* database test */
router.get('/', async(req, res, next) => {
  console.log("test");

  let testsql = "SELECT * FROM user";
  let result = await db.queryParamCnt_Arr(testsql,[]);

  if(result.length == 0){
    console.log("test ok");
  }else{
    console.log("id : " + result[0].id);
  }

  res.json({
    data : result
  });
});

module.exports = router;
