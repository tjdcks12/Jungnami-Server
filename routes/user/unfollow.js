/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  유저가 유저를 언팔로우하기  */
/*  /user/unfollow/  */
router.post('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }

    let follower_id = chkToken.id;
    let following_id = req.body.following_id;

    let insertSql = "DELETE FROM follow WHERE f_follower_id = ? AND f_following_id = ?;"
    let insertQuery = await db.queryParamCnt_Arr(insertSql,[follower_id, following_id]);

    res.status(201).send({
      message : "Delete Data Success"
    });

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});

module.exports = router;
