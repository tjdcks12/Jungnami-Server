/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');


/*  푸시알림 목록보기  */
/*  /user/push  */
router.get('/', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    res.status(401).send({
      message : "Access Denied"
    });
    return;
  }

  let u_id = chkToken.id;
  console.log(u_id)

  try {

    // 나의 푸시알림 목록
    let pushsql = "SELECT * FROM push WHERE p_user_id = ?";
    let pushdata = await db.queryParamCnt_Arr(pushsql,[u_id]);

        if(pushdata.length == 0){
          console.log("query not ok");

          res.status(300).json({
            message : "no push data"
          });
          return;
        }else{
          console.log("query ok");
        }

    var result = [];
    for (var i=0; i<pushdata.length; i++) {
      var r = {};

      try {
        r.button = "";

        // 팔로우 관련
        if(pushdata[i].p_follower_id != null) {
          let followerinfosql = "SELECT id, nickname, img_url FROM user WHERE id = ?;";
          let followerinfoquery = await db.queryParamCnt_Arr(followerinfosql,[pushdata[i].p_follower_id]);

          r.id = followerinfoquery[0].id;
          r.img_url = followerinfoquery[0].img_url;
          r.actionname = followerinfoquery[0].nickname;
          r.actionmessage = "님이 팔로우 했습니다.";

          // 내가 그 사람을 팔로잉 하고 있는지
          let followersql = "SELECT * FROM follow WHERE f_follower_id = ? AND f_following_id = ?;";
          let followerdata = await db.queryParamCnt_Arr(followersql,[r.id, u_id]);

          if(followerdata.length == -1) {
            r.button = "팔로우"; // 팔로우 할 수 있다
          } else {
            r.button = "팔로잉"; // 팔로잉 중이다
          }

          let followingtimesql = "SELECT time FROM follow WHERE f_follower_id = ? AND f_following_id = ?;";
          let followingtimedata = await db.queryParamCnt_Arr(followingtimesql,[r.id, u_id]);

          r.time = checktime.checktime(followingtimedata[0].time);

        } // 보드 댓글 관련
        else if (pushdata[i].p_boardComment_id != null) {

          let boardcommentinfosql = "SELECT bc_user_id, writingtime FROM boardComment WHERE id = ?;"
          let boardcommentinfodata = await db.queryParamCnt_Arr(boardcommentinfosql,[pushdata[i].p_boardComment_id]);

          r.id = boardcommentinfodata[0].bc_user_id;

          let boardcommentusersql = "SELECT nickname, img_url FROM user WHERE id = ?;"
          let boardcommentuserdata = await db.queryParamCnt_Arr(boardcommentusersql,[r.id]);

          r.img_url = boardcommentuserdata[0].img_url;
          r.actionname = boardcommentuserdata[0].nickname;
          r.actionmessage = "님이 회원님의 게시물에 댓글을 남겼습니다";
          r.time = checktime.checktime(boardcommentinfodata[0].writingtime);

        } // 보드 좋아요 관련
        else if (pushdata[i].p_boardLike_id != null) {

          let boardlikeinfosql = "SELECT bl_user_id, writingtime FROM boardLike WHERE id = ?;"
          let boardlikeinfodata = await db.queryParamCnt_Arr(boardlikeinfosql,[pushdata[i].p_boardLike_id]);

          r.id = boardlikeinfodata[0].bl_user_id;

          let boardlikeusersql = "SELECT nickname, img_url FROM user WHERE id = ?;"
          let boardlikeuserdata = await db.queryParamCnt_Arr(boardlikeusersql,[r.id]);

          r.img_url = boardlikeuserdata[0].img_url;
          r.actionname = boardlikeuserdata[0].nickname;
          r.actionmessage = "님이 회원님의 게시물에 댓글을 남겼습니다";
          r.time = checktime.checktime(boardlikeinfodata[0].writingtime);

        }

        r.ischecked = pushdata[i].ischecked;

        result.push(r);

      }catch(error){
        console.log(error);
      } finally {
      }
    }

    let updatepushsql = "UPDATE push SET ischecked = true WHERE p_user_id = ?;"
    let updatepushdata = await db.queryParamCnt_Arr(updatepushsql,[u_id]);

    if (updatepushdata.affectedRows < 1) {
      res.status(204).json({
        message : "Update Error"
      });
      return;
    } else {
      res.status(200).send({
        message : "Successfully Get Push List",
        data : result
      });
    }

  } catch(error) {
    res.status(500).send({
      message : "Internal Server Error"
    });
  }

});

module.exports = router;
