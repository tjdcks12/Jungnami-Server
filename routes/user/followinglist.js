/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  팔로잉 리스트 보여주기  */
/*  /user/followinglist/:f_id  */
router.get('/:f_id', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }

    let u_id = chkToken.id;
    let follower_id = req.params.f_id;

    let followinglistSql = "SELECT f_following_id, nickname, img_url FROM follow, user "
        followinglistSql += "WHERE follow.f_following_id = user.id AND f_follower_id = ?;"

    let followinglistQuery = await db.queryParamCnt_Arr(followinglistSql,[follower_id]);

    if(followinglistQuery.length == 0){
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

      for (var i=0; i<followinglistQuery.length; i++) {
        var r = {};

        r.following_id = followinglistQuery[i].f_following_id;
        r.follower_nickname = followinglistQuery[i].nickname;
        r.follower_img_url = followinglistQuery[i].img_url;
        r.isMyFollowing = "팔로우"; // 팔로우 하세요

        for (var j=0; j<followingSelectQuery.length; j++) {

          if(followinglistQuery[i].f_following_id == followingSelectQuery[j].f_following_id) {
            r.isMyFollowing = "팔로잉"; // 팔로잉 중이에요
            break;
          } else if (followinglistQuery[i].f_following_id == u_id) {
            r.isMyFollowing = "나"; // 나다!
            break;
          }
        }
        result.push(r);
      }
    }

    console.log(result);

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
