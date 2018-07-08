/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  유저가 유저를 팔로우하기  */
/*  /user/follow/  */
router.post('/', async(req, res, next) => {

  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
        return;
    }

    let follower_id = chkToken.id;
    let following_id = req.body.following_id;

    let insertfollowSql = "INSERT INTO follow (f_follower_id, f_following_id) VALUES (?, ?);"
    let insertfollowQuery = await db.queryParamCnt_Arr(insertfollowSql,[follower_id, following_id]);

    let pushSql = "INSERT INTO push (p_follower_id, p_user_id) VALUES (?, ?);"
    let pushQuery = await db.queryParamCnt_Arr(pushSql,[follower_id, following_id]);

    let selectfollowerSql = "SELECT nickname FROM user WHERE id = ?;"
    let selectfollowerQuery = await db.queryParamCnt_Arr(selectuserSql,[follower_id]);


    
    p_text = selectfollowerQuery[0].nickname + "님이 팔로우 했습니다.";
    p_user_id = following_id;

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
