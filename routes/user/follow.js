/*  팔로우하기 + 언팔로우하기  */
/*  /user/follow/  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const hangul = require('hangul-js');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;


/*  유저가 유저를 팔로우하기  */
/*  /user/follow/  */
router.post('/', async(req, res, next) => {

  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let follower_id = chkToken.id;
    let following_id = req.body.following_id;

    let insertfollowSql = 
    `
    INSERT INTO
    follow (f_follower_id, f_following_id)
    VALUES (?, ?)
    `
    let insertfollowQuery = await db.queryParamCnt_Arr(insertfollowSql,[follower_id, following_id]);
    if(!insertfollowQuery){
      return next("500");
    }

    let pushSql = "INSERT INTO push (p_follower_id, p_user_id) VALUES (?, ?);"
    let pushQuery = await db.queryParamCnt_Arr(pushSql,[follower_id, following_id]);
    if(!pushQuery){
      return next("500");
    }

    let selectfollowerSql = "SELECT nickname FROM user WHERE id = ?;"
    let selectfollowerQuery = await db.queryParamCnt_Arr(selectfollowerSql,[follower_id]);


    /* push 알람 */
    p_text = selectfollowerQuery[0].nickname + "님이 팔로우 했습니다.";

    // client fcmToken 가져오기
    let select_fcmtoken = 'SELECT fcmToken FROM user WHERE id = ?';
    let result_fcmtoken = await db.queryParamCnt_Arr(select_fcmtoken, [following_id]);

    if(result_fcmtoken[0].fcmToken != null){
      var push_data = await get_pushdata.get_pushdata(result_fcmtoken[0].fcmToken, p_text);
      var fcm = new FCM(serverKey);

      fcm.send(push_data, function(err, response) {
        console.log(push_data);
        if (err) {
          console.error('Push메시지 발송에 실패했습니다.');
          console.error(err);
          return;
        }

        console.log('Push메시지가 발송되었습니다.');
        console.log(response);
      });
    } else {
      console.log("No fcmToken");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    console.log(error);
    return next("500");
  }

});



/*  내가 다른 유저를 언팔로우하기  */
/*  /user/follow/  */
router.delete('/:f_id', async(req, res, next) => {

  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let follower_id = chkToken.id;
    let following_id = req.params.f_id;

    let deleteFollowSql =
    `
    DELETE
    FROM follow
    WHERE f_follower_id = ?
    AND f_following_id = ?
    `
    let result_deleteFollow = await db.queryParamCnt_Arr(deleteFollowSql,[follower_id, following_id]);

    if(!result_deleteFollow){
      return next("500");
    }

    let deletePushSql =
    `
    DELETE
    FROM push
    WHERE p_follower_id = ?
    AND p_user_id = ?
    `
    let result_deletePush = await db.queryParamCnt_Arr(deletePushSql,[follower_id, following_id]);

    if(!result_deletePush){
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
