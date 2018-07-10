/* 게시판 검색 */
/*  /search/board */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');

const jwt = require('../../module/jwt.js');
const addComma = require('../../module/addComma.js');
const db = require('../../module/pool.js');
const hangul = require('hangul-js');
const checktime = require('../../module/checktime.js');

router.get('/:keyword', async(req, res, next) => {

  // 현재시간
  var currentTime = new Date();

  // 자음, 모음까지 검색 되도록 하기 위해 사용
  let searchWord = req.params.keyword;
  let searcher = new hangul.Searcher(searchWord);

  try{
    let select_content = "SELECT board.id as id, nickname, content, writingtime, board.img_url FROM board JOIN user ON board.b_user_id = user.id ORDER BY writingtime DESC";
    let result_content = await db.queryParamCnt_Arr(select_content);
    console.log("test : " + result_content);

    // return할 result
    var result = [];
    for(var i=0; i<result_content.length; i++){
      var data = {};
      if(searcher.search(result_content[i].content) >= 0){
        // id
        data.id = result_content[i].id;

        // 닉네임
        data.nickname = result_content[i].nickname;

        // 내용
        data.content = result_content[i].content;

        // 사진
        data.img_url = result_content[i].img_url;

        // 시간 계산
        // 작성 10분 이내
        var writingtime = result_content[i].writingtime;
        data.writingtime = checktime.checktime(writingtime);

        // 좋아요 수
        let select_like = "SELECT * FROM boardLike WHERE bl_board_id = ?";
        let result_like = await db.queryParamCnt_Arr(select_like, result_content[i].id);
        data.likecnt = addComma.addComma(result_like.length);

        // 댓글 수
        let select_comment = "SELECT * FROM boardComment WHERE bc_board_id = ?";
        let result_comment = await db.queryParamCnt_Arr(select_comment, result_content[i].id);
        data.commentcnt = addComma.addComma(result_comment.length);

        result.push(data);
      }
    }

    if(result.length == 0){
      res.status(300).json({
        message : "No data"
      });
      return;
    }

    res.status(200).json({
      data : result,
      message : "Success"
    });

  }catch(error) {
    console.log(error);
    res.status(500).send({
      message : "Internal Server Error"
    });
  }
});

module.exports = router;
