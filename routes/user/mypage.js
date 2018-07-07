/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


// 스크랩 컨텐츠
// contents id, imgurl, title, writingtime

// 마이 피드
// board id 
// b_user_id => select nickname, img_url from user where b_user_id = user.id
// content
// img_url
// writing_time
// shared => select (b_user_id => select nickname, img_url from user where id=b_user_id
//                   content, img_url, writing_time) from board
//                   where shard = board.id

// board_id 
// writter 
// 
// 


/*  유저의 마이 페이지  */
/*  /user/mapage/:mypage_id  */
router.get('/:mypage_id', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  let u_id;

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id; 
  }

  let mypage_id = req.params.mypage_id; // 해당 계정 주인

  try {

    // 스크랩 수, 내 피드 수, 팔로워 수, 팔로잉 수
    let scrapSql = "SELECT count(*) as scrapcnt FROM scrap WHERE s_user_id = ?"
    let scrapQuery = await db.queryParamCnt_Arr(scrapSql,[mypage_id]);

    let boardSql = "SELECT count(*) as boardcnt FROM board WHERE b_user_id = ?"
    let boardQuery = await db.queryParamCnt_Arr(boardSql,[mypage_id]);

    let followerSql = "SELECT count(*) as followercnt FROM follow WHERE f_following_id = ?"
    let followerQuery = await db.queryParamCnt_Arr(followerSql,[mypage_id]);

    let followingSql = "SELECT count(*) as followingcnt FROM follow WHERE f_follower_id = ?"
    let followingQuery = await db.queryParamCnt_Arr(followingSql,[mypage_id]);



    let selectSql = "SELECT * FROM user WHERE id = ?"
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[mypage_id]);

    var result = {};
    if(selectQuery.length == 0){
      console.log("query not ok");

      res.status(300).send({
            message: "No Data"
      });
      return;
      
    }else{
      console.log("query ok");

      result.mypage_id = mypage_id;
      result.nickname = selectQuery[0].nickname;
      result.img_url = selectQuery[0].img_url;
      result.scrapcnt = scrapQuery[0].scrapcnt;
      reuslt.boardcnt = boardQuery[0].boardcnt;
      result.followercnt = followerQuery[0].followercnt;
      result.followingcnt = followingQuery[0].followingcnt;

      if (u_id == mypage_id) {  // 내가 내 계정에 들어온거라면 

        result.point = selectQuery[0].point;
        result.voting_cnt = selectQuery[0].voting_cnt;

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
