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

    let u_id;

    if(chkToken == -1) {
      u_id = '';
    } else {
      u_id = chkToken.id;
    }

    let follower_id = req.params.f_id;

    let followinglistSql = "SELECT f_following_id, nickname, img_url FROM follow, user "
        followinglistSql += "WHERE follow.f_following_id = user.id AND f_follower_id = ?;"

    let followinglistQuery = await db.queryParamCnt_Arr(followinglistSql,[follower_id]);

    if(followinglistQuery.length == 0){
      console.log("query not ok");

      res.status(300).send({
            message: "No Data"
      });
      return;

    }else{
      console.log("query ok");

    }


    let followingSelectSql = "SELECT f_following_id FROM follow WHERE f_follower_id = ?"
    let followingSelectQuery = await db.queryParamCnt_Arr(followingSelectSql,[u_id]);

    var result = []; // following_id, following_nickname, following_img_url, isMyFollowing


    if(u_id != '' && followingSelectQuery == undefined) { // 로그인이 되어있는데 팔로우정보도 못가져오면
      console.log("query not ok");

      res.status(300).send({
            message: "No Data"
      });
      return;

    }else{
      console.log("query ok");

      for (var i=0; i<followinglistQuery.length; i++) {
        var r = {};

        r.following_id = followinglistQuery[i].f_following_id;
        r.following_nickname = followinglistQuery[i].nickname;
        r.following_img_url = followinglistQuery[i].img_url;
        r.isMyFollowing = ''; // 로그인 안 되어 있을때 -> button 안만들어줘도 됨

        if (u_id != '') { // 로그인 되어있을 때에는?

          r.isMyFollowing = "팔로우"; // 팔로우 하세요

          for (var j=0; j<followingSelectQuery.length; j++) {

            // 내가 이 사람을 팔로잉 중이에요
            if(followinglistQuery[i].f_following_id == followingSelectQuery[j].f_following_id) {
              //if (follower_id == u_id) // 나의 팔로잉 목록이라면, 팔로잉 취소할래?
              //  r.isMyFollowing = "취소";
              //else
                r.isMyFollowing = "팔로잉";
              break;
            } // 나다!
            else if (followinglistQuery[i].f_following_id == u_id) {
              r.isMyFollowing = "나";
              break;
            }
          }
        }

        result.push(r);
      }
    }

    console.log(result)

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
