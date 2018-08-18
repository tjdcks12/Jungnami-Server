/*  300명의 의원 목록 (이름, 정당, 지역구)  */
/*  /legislator  */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');



router.get('/', async(req, res, next) => {

    try {
      let legislatorSql =
      `
      SELECT id, name, l_party_name, position
      FROM legislator
      `
      let legislatorQuery = await db.queryParamCnt_Arr(legislatorSql,[]);
  
      res.status(200).send({
        message : "Success",
        data : legislatorQuery
      });
  
  
    } catch(error) {
      return next("500");
    }
});
  