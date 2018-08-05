//커뮤니티 탭 들어오면 메인 화면 -> 페이스북 뉴스피드
var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

//board_id, b_user_id, content, imgurl writing time, shared,
//user의 profile_url, board_id의 like_cnt, comment_cnt

router.get('/', async (req, res, next) => {
  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  var user_img_url;
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
    var select_img = `SELECT img_url FROM user WHERE id = ?`;
    var result_img = await db.queryParamCnt_Arr(select_img, userid);
    if(result_img.length != 0){
      user_img_url = result_img[0].img_url;
    }
  }

  try{
    // 푸쉬알람 카운트 가져오기
    let pushcntSql =
    `
    SELECT count(*) as pushcnt
    FROM push
    WHERE p_user_id = ? AND ischecked = false
    `;

    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);


    // 게시글 불러오기 ( 공유뺴고, 시간순)
    var select_board =
    `
    SELECT *
    FROM board
    WHERE shared = 0
    ORDER BY writingtime DESC
    `

    var result_board = await db.queryParamCnt_Arr(select_board);


    // 좋아요한 글 가져오기
    var select_like =
    `
    SELECT bl_board_id
    FROM boardLike
    WHERE bl_user_id = ?
    `
    var result_like = await db.queryParamCnt_Arr(select_like, [userid]);

    var result = [];
    for(var i=0; i<result_board.length; i++){
      var data = {};

      // 닉네임
      var select_user = `
      SELECT *
      FROM user
      WHERE id=?
      `

      var result_user = await db.queryParamCnt_Arr(select_user, [result_board[i].b_user_id]);

      data.boardid = result_board[i].id;

      // 유저 정보
      data.user_id = result_user[0].id;
      data.nickname = result_user[0].nickname;
      data.userimg = result_user[0].img_url;

      // 보드 정보
      data.img = result_board[i].img_url;
      data.writingtime = checktime.checktime(result_board[i].writingtime);
      data.content = result_board[i].content;

      // 좋아요 여부
      data.islike = 0;
      for(var j=0; j<result_like.length; j++){
        if(result_like[j].bl_board_id == result_board[i].id){
          data.islike = 1;
          break;
        }
      }

      // 좋아요 카운트
      var cnt_like =
      `
      SELECT count(*) AS cnt
      FROM boardLike
      WHERE bl_board_id = ?
      `;
      var result_likecnt = await db.queryParamCnt_Arr(cnt_like, [result_board[i].id]);
      data.likecnt = result_likecnt[0].cnt;

      // 댓글 카운트
      var cnt_comment =
      `
      SELECT count(*) AS cnt
      FROM boardComment
      WHERE bc_board_id = ?
      `;
      var result_cntcomment = await db.queryParamCnt_Arr(cnt_comment, [result_board[i].id]);
      data.commentcnt = result_cntcomment[0].cnt;

      result.push(data);
    }

    res.status(200).send({
      "message" : "Success",
      "data" : {
        content : result,
        user_img_url : user_img_url,
        alarmcnt : pushcntQuery[0].pushcnt
      }
    });

  }catch(err){
    return next(err);
  }
});

module.exports = router;
