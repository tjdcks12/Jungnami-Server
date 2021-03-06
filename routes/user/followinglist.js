/*  팔로잉 리스트 보여주기 + 검색결과 보여주기  */
/*  /user/:f_id/followerlist  */

var express = require('express');
const router = express.Router({mergeParams : true});

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const hangul = require('hangul-js');


/*  팔로잉 리스트 보여주기  */
/*  /user/:f_id/followinglist  */
router.get('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    let u_id;

    if(chkToken == -1) {
      u_id = '';
    } else {
      u_id = chkToken.id;
    }

    let follower_id = req.params.f_id;

    let followinglistSql =
    `
    SELECT f_following_id, nickname, img_url
    FROM follow, user
    WHERE follow.f_following_id = user.id AND f_follower_id = ?
    `

    let followinglistQuery = await db.queryParamCnt_Arr(followinglistSql,[follower_id]);

    if(followinglistQuery.length == 0){
      return next("1204");
    }

    let followingSelectSql =
    `
    SELECT f_following_id
    FROM follow
    WHERE f_follower_id = ?
    `
    let followingSelectQuery = await db.queryParamCnt_Arr(followingSelectSql,[u_id]);




    var result = []; // following_id, following_nickname, following_img_url, isMyFollowing

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

    res.status(200).send({
      message : "Success",
      data : result
    });

  } catch(error) {
    return next("500");
  }

});




/*  팔로잉 리스트 보여주기  */
/*  /user/:f_id/followinglist/search/:keyword  */
router.get('/search/:keyword', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    let u_id;

    if(chkToken == -1) {
      u_id = '';
    } else {
      u_id = chkToken.id;
    }

    let follower_id = req.params.f_id;

    let searchFollowing = req.params.keyword;
    let searcher = new hangul.Searcher(searchFollowing);

    let followinglistSql =
    `
    SELECT f_following_id, nickname, img_url
    FROM follow, user
    WHERE follow.f_following_id = user.id AND f_follower_id = ?
    `

    let followinglistQuery = await db.queryParamCnt_Arr(followinglistSql,[follower_id]);

    if(followinglistQuery.length == 0){
      return next("1204");
    }

    let followingSelectSql =
    `
    SELECT f_following_id
    FROM follow
    WHERE f_follower_id = ?
    `

    let followingSelectQuery = await db.queryParamCnt_Arr(followingSelectSql,[u_id]);




    var result = []; // following_id, following_nickname, following_img_url, isMyFollowing

    for (var i=0; i<followinglistQuery.length; i++) {
      var r = {};

      r.following_id = followinglistQuery[i].f_following_id;
      r.following_nickname = followinglistQuery[i].nickname;
      r.following_img_url = followinglistQuery[i].img_url;
      //r.isMyFollowing = "팔로우"; // 팔로우 하세요
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




    var searchResult = [];
    for(var i=0; i<result.length; i++){
      if(searcher.search(result[i].following_nickname) >= 0){

        searchResult.push(result[i]);
      }
    }

    if(searchResult.length == 0){
      return next("1204");
    }

    res.status(200).send({
      message : "Success",
      data : searchResult
    });

  } catch(error) {
    return next("500");
  }

});

module.exports = router;
