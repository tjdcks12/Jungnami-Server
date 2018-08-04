/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  내가 다른 유저를 언팔로우하기  */
/*  /user/unfollow/  */
router.delete('/:f_id', async(req, res, next) => {

  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let follower_id = chkToken.id;
    let following_id = req.params.f_id;

    let deleteSql =
    `
    DELETE
    FROM follow
    WHERE f_follower_id = ? AND f_following_id = ?
    `
    let result_delete = await db.queryParamCnt_Arr(deleteSql,[follower_id, following_id]);

    if(!result_delete){
      return next("500");
    }

    res.status(200).send({
      message : "Success"
    });

  } catch(error) {
    return next("500");
  }

});

module.exports = router;
