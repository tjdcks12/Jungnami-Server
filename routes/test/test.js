/* test page */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const errors = require('../../errors');

router.get('/', async(req, res, next) => {
  try{
    let updateSql = "delete * from board where id=1"
    let insertQuery = await db.queryParamCnt_Arr(updateSql, []);
    console.log("뮤슨 값? : " + insertQuery)
    if(!insertQuery){
      next("500");
    }

    // update : undefined
  }catch(error){
    console.log("에러2");
  }

});

module.exports = router;
