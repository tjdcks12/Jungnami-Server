/*  유저의 마이 페이지  */
/*  /user/mapage  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');


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
    let scrapSql =
    `
    SELECT count(*) as scrapcnt
    FROM scrap
    WHERE s_user_id = ?
    `
    let scrapQuery = await db.queryParamCnt_Arr(scrapSql,[mypage_id]);

    let boardSql =
    `
    SELECT count(*) as boardcnt
    FROM board
    WHERE b_user_id = ?
    `
    let boardQuery = await db.queryParamCnt_Arr(boardSql,[mypage_id]);

    let followerSql =
    `
    SELECT count(*) as followercnt
    FROM follow
    WHERE f_following_id = ?
    `
    let followerQuery = await db.queryParamCnt_Arr(followerSql,[mypage_id]);

    let followingSql =
    `
    SELECT count(*) as followingcnt
    FROM follow
    WHERE f_follower_id = ?
    `
    let followingQuery = await db.queryParamCnt_Arr(followingSql,[mypage_id]);



    let selectSql = "SELECT * FROM user WHERE id = ?"
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[mypage_id]);

    var result = {};
    if(selectQuery.length == 0){
      return next("1204");
    }else{
      result.mypage_id = mypage_id;
      result.nickname = selectQuery[0].nickname;
      result.img = selectQuery[0].img_url;
      result.scrapcnt = scrapQuery[0].scrapcnt;
      result.boardcnt = boardQuery[0].boardcnt;
      result.followingcnt = followingQuery[0].followingcnt;
      result.followercnt = followerQuery[0].followercnt;

      // 내가 그 사람을 팔로잉 하고 있는지
      let followersql =
      `
      SELECT *
      FROM follow
      WHERE f_follower_id = ? AND f_following_id = ?
      `;
      let followerdata = await db.queryParamCnt_Arr(followersql,[u_id, mypage_id]);
      if(followerdata.length == 0){
        result.isfollow = 0;
      }
      else{
        result.isfollow = 1;
      }
      
      if (u_id == mypage_id) {  // 내가 내 계정에 들어온거라면

        result.point = selectQuery[0].point;
        result.votingcnt = selectQuery[0].voting_cnt;

      } else {
        result.point = 0;
        result.votingcnt = 0;
      }

      let pushcntSql =
      `
      SELECT count(*) as pushcnt
      FROM push
      WHERE p_user_id = ? AND ischecked = false
      `
      let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[mypage_id]);

      if(pushcntQuery.length != 0){
          result.pushcnt = pushcntQuery[0].pushcnt;
      }
      else{
        result.pushcnt = 0;
      }



      // 스크랩한 컨텐츠
      result.scrap = [];

      let selectscrapSql =
      `
      SELECT *
      FROM scrap
      WHERE s_user_id = ?
      ORDER BY id DESC
      `
      let selectscrapQuery = await db.queryParamCnt_Arr(selectscrapSql,[mypage_id]);

      for(var i=0; i<selectscrapQuery.length; i++) {

        var scrap = {}

        scrap.c_id = selectscrapQuery[i].s_contents_id;

        let selectcontentsSql =
        `
        SELECT *
        FROM contents
        WHERE id = ?
        `
        let selectcontentsQuery = await db.queryParamCnt_Arr(selectcontentsSql,[scrap.c_id]);

        scrap.c_title = selectcontentsQuery[0].title;
        scrap.thumbnail = selectcontentsQuery[0].thumbnail_url;
        scrap.text = selectcontentsQuery[0].category + " · " + checktime.checktime(selectcontentsQuery[0].writingtime);

        result.scrap.push(scrap);
      }



      // 작성한 커뮤니티 게시물
      result.board = [];

      let selectboardSql =
      `
      SELECT *
      FROM board
      WHERE b_user_id = ?
      ORDER BY writingtime DESC
      `
      let selectboardQuery = await db.queryParamCnt_Arr(selectboardSql,[mypage_id]);

          for(var i=0; i<selectboardQuery.length; i++) {

            var board = {};

            board.b_id = selectboardQuery[i].id;

            let selectuserSql =
            `
            SELECT *
            FROM user
            WHERE id = ?
            `
            let selectuserQuery = await db.queryParamCnt_Arr(selectuserSql,[mypage_id]);

            board.u_id = selectuserQuery[0].id;
            board.u_nickname = selectuserQuery[0].nickname;
            board.u_img = selectuserQuery[0].img_url;

            board.source = [];

            // 내가 직접 쓴 글
            if (selectboardQuery[i].shared == 0) {

              let selectboardinfoSql =
              `
              SELECT *
              FROM board
              WHERE id = ?
              `
              let selectboardinfoQuery = await db.queryParamCnt_Arr(selectboardinfoSql,[board.b_id]);

              board.b_content = selectboardinfoQuery[0].content;
              board.b_img = selectboardinfoQuery[0].img_url;

            } // 공유한 글
            else if (selectboardQuery[i].shared > 0) {
              source = {};

              let selectsharedboardinfoSql =
              `
              SELECT *
              FROM board
              WHERE id = ?
              `
              let selectsharedboardinfoQuery = await db.queryParamCnt_Arr(selectsharedboardinfoSql,[selectboardQuery[i].shared]);

              if(selectsharedboardinfoQuery.length > 0){

                let selectshareduserSql =
                `
                SELECT *
                FROM user
                WHERE id = ?
                `
                let selectshareduserQuery = await db.queryParamCnt_Arr(selectshareduserSql,[selectsharedboardinfoQuery[0].b_user_id]);

                source.u_id = selectshareduserQuery[0].id;
                source.u_nickname = selectshareduserQuery[0].nickname;
                source.u_img = selectshareduserQuery[0].img_url;

                source.b_content = selectsharedboardinfoQuery[0].content;
                source.b_img = selectsharedboardinfoQuery[0].img_url;
                source.b_time = checktime.checktime(selectsharedboardinfoQuery[0].writingtime);

                board.source.push(source);

                board.b_content = '0';
                board.b_img = '0';
              } else {
                let deleteSharedBoardSql =
                  `
                  DELETE
                  FROM board
                  WHERE id = ?
                  `;
                let deleteSharedBoardQuery = await db.queryParamCnt_Arr(deleteSharedBoardSql,[selectboardQuery[i].id]);

                continue;
              }

            }


            // 내가 좋아요한 글 가져오기
            var select_like =
            `
            SELECT bl_board_id
            FROM boardLike
            WHERE bl_user_id = ?
            `
            var result_like = await db.queryParamCnt_Arr(select_like, [u_id]);

            // 좋아요 여부
            board.islike = 0;
            for(var j=0; j<result_like.length; j++){
              if(result_like[j].bl_board_id == selectboardQuery[i].id){
                board.islike = 1;
                break;
              }
            }

            // 좋아요 개수
            let getlikecntSql =
            `
            SELECT count(*) as like_cnt
            FROM boardLike
            WHERE bl_board_id = ?
            `;
            let getlikecntQuery = await db.queryParamCnt_Arr(getlikecntSql, [board.b_id]);

            // 댓글 개수
            let getcommentcntSql =
            `
            SELECT count(*) as comment_cnt
            FROM boardComment
            WHERE bc_board_id = ?
            `;
            let getcommentcntQuery = await db.queryParamCnt_Arr(getcommentcntSql, [board.b_id] );

            board.b_time = checktime.checktime(selectboardQuery[i].writingtime);
            board.like_cnt = getlikecntQuery[0].like_cnt;
            board.comment_cnt = getcommentcntQuery[0].comment_cnt;

            result.board.push(board);
          }
    }

    res.status(200).send({
        message : "Success",
        data : result
      });

  } catch(error) {
    return next("500");
  }
});

module.exports = router;
