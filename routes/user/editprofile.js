/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  팔로워 리스트 보여주기  */
/*  /user/mypage/editprofile  */
router.get('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }

    let u_id = chkToken.id;

    let myprofileSql = "SELECT f_follower_id, nickname, img_url FROM follow, user "
        myprofileSql += "WHERE follow.f_follower_id = user.id AND f_following_id = ?;"

    let followerlistQuery = await db.queryParamCnt_Arr(followerlistSql,[following_id]);

    if(followerlistQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");

    }


    let followingSelectSql = "SELECT f_following_id FROM follow WHERE f_follower_id = ?"

    let followingSelectQuery = await db.queryParamCnt_Arr(followingSelectSql,[u_id]);

    var result = []; // follower_id, follower_nickname, follower_img_url, isMyFollowing


    if(followingSelectQuery.length == 0) {
      console.log("query not ok");
    }else{
      console.log("query ok");

      for (var i=0; i<followerlistQuery.length; i++) {
        var r = {};

        r.follower_id = followerlistQuery[i].f_follower_id;
        r.follower_nickname = followerlistQuery[i].nickname;
        r.follower_img_url = followerlistQuery[i].img_url;
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
        result.push(r);
      }
    }

    res.status(200).send({
        message : "Select Data Success",
        data : result
      });

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});

module.exports = router;
