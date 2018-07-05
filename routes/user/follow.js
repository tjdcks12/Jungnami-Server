/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  유저가 유저를 팔로우하기  */
/*  /user/follow/  */
router.post('/', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
      res.status(401).send({
          message : "Access Denied"
      });
  }

  try {

    let following_id = chkToken.id;
    let following_id = req.body.following_id;

    let insertSql = "INSERT INTO follow (f_follower_id, f_following_id) values (?, ?);"
    let insertQuery = await db.queryParamCnt_Arr(insertSql,[following_id, following_id]);

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
