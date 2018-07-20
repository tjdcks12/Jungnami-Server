/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  팔로워 리스트 보여주기  */
/*  /user/followerlist/:f_id  */
router.get('/:f_id', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    let u_id;

    if(chkToken == -1) {
      u_id = '';
    } else {
      u_id = chkToken.id;
    }

    let following_id = req.params.f_id;

    let followerlistSql =
    `
    SELECT f_follower_id, nickname, img_url
    FROM follow, user
    WHERE follow.f_follower_id = user.id AND f_following_id = ?
    `

    let followerlistQuery = await db.queryParamCnt_Arr(followerlistSql,[following_id]);

    if(followerlistQuery.length == 0){
      return next("1204");
      // console.log("query not ok");
      //
      // res.status(300).send({
      //       message: "No Data"
      // });
      // return;
    }


    let followingSelectSql =
    `
    SELECT f_following_id
    FROM follow
    WHERE f_follower_id = ?
    `

    let followingSelectQuery = await db.queryParamCnt_Arr(followingSelectSql,[u_id]);

    var result = []; // follower_id, follower_nickname, follower_img_url, isMyFollowing


    if(u_id != '' && followingSelectQuery == undefined) { // 로그인이 되어있는데 팔로우정보도 못가져오면
      return next("1204");
      // console.log("query not ok");
      //
      // res.status(300).send({
      //       message: "No Data"
      // });
      // return;

    }else{
      for (var i=0; i<followerlistQuery.length; i++) {
        var r = {};

        r.follower_id = followerlistQuery[i].f_follower_id;
        r.follower_nickname = followerlistQuery[i].nickname;
        r.follower_img_url = followerlistQuery[i].img_url;
        r.isMyFollowing = ''; // 로그인 안 되어 있을때 -> button 안만들어줘도 됨

        if (u_id != '') { // 로그인 되어있을 때에는?

          r.isMyFollowing = "팔로우"; // 팔로우 하세요

          for (var j=0; j<followingSelectQuery.length; j++) {

            if(followerlistQuery[i].f_follower_id == followingSelectQuery[j].f_following_id) {
              r.isMyFollowing = "팔로잉"; // 팔로잉 중이에요
              break;
            } else if (followerlistQuery[i].f_follower_id == u_id) {
              r.isMyFollowing = "나"; // 나다!
              break;
            }
          }
        }

        result.push(r);
      }
    }

    res.status(200).send({
        message : "Success",
        data : result
      });

  } catch(error) {
    return next("500");
    // res.status(500).send({
    //     message : "Internal Server Error"
    //   });
  }
});

module.exports = router;
