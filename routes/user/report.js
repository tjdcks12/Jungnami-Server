/*  신고하기  */
/*  /user/report  */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');


router.post('/',  async (req, res, next) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let user_id = chkToken.id;
    let relation = req.body.relation;
    let content = req.body.content;

    console.log("new reporting!");
    
    let reportSql =
    `
    INSERT INTO
    myjungnami.report (r_user_id, relation, content)
    VALUES (?, ?, ?)
    `;
    let reportQuery = await db.queryParamCnt_Arr(reportSql, [user_id, relation, content]);

    if(!reportQuery){
      console.log(err);
      return next("500");
    }

    res.status(201).send({
      "message" : "Success",
    });
  }
  catch(err) {
    return next(err);
  }

});



module.exports = router;
