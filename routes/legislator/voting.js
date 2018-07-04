var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/*  의원에게 투표하기  */
/*  /legislator/voting  */
router.post('/', async(req, res, next) => {

  try {
    let u_id = req.body.u_id;
    let l_id =+ req.body.l_id;
    let islike =+ req.body.islike;

    let insertSql = "insert into legislatorVote (lv_legislator_id, lv_user_id, islike) values (?, ?, ?);"
    let insertQuery = await db.queryParamCnt_Arr(insertSql,[l_id, u_id, islike]);

    res.status(201).send({
        message : "Insert Data Success"
      });

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});

module.exports = router;
