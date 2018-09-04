/*  커뮤니티 글  */
/*  /board  */

var express = require('express');
const async = require('async');
var router = express.Router();

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');
const upload = require('../../module/multer_board_img.js');
const hangul = require('hangul-js');


/*  커뮤니티 게시글 리스트 보여주기  */
/*  /board/:pre  */
router.get('/:pre', async (req, res, next) => {
  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  var user_img_url;
  let pre =+ req.params.pre;  // boardid
  if(pre == 0){
    pre = 100000000;
  }

  let number = 10;
 
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
  }

  try{

    var select_img = 
    `
    SELECT img_url FROM user WHERE id = ?
    `;
    var result_img = await db.queryParamCnt_Arr(select_img, userid);

    if(result_img.length != 0){
      user_img_url = result_img[0].img_url;
    }

    // 푸쉬알람 카운트 가져오기
    let pushcntSql =
    `
    SELECT count(*) as pushcnt
    FROM push
    WHERE p_user_id = ? AND ischecked = false
    `;

    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);


    // 게시글 불러오기 (공유뺴고, 시간순)
    var select_board =
    `
    SELECT *
    FROM board
    WHERE shared = 0
    ORDER BY writingtime DESC
    `;

    var result_board = await db.queryParamCnt_Arr(select_board);


    // 좋아요한 글 가져오기
    var select_like =
    `
    SELECT bl_board_id
    FROM boardLike
    WHERE bl_user_id = ?
    `;
    var result_like = await db.queryParamCnt_Arr(select_like, [userid]);

    var result = [];
    for(var i=0; i<result_board.length; i++){
      var data = {};
      
      if(number <= 0)
        break;
      else if(result_board[i].id >= pre)
        continue;

      number--;

      // 글 인덱스
      data.boardid = result_board[i].id;

      // 글 작성자 정보
      var select_user = 
      `
      SELECT *
      FROM user
      WHERE id = ?
      `;
      var result_user = await db.queryParamCnt_Arr(select_user, [result_board[i].b_user_id]);

      data.user_id = result_user[0].id;
      data.nickname = result_user[0].nickname;
      data.userimg = result_user[0].img_url;

      // 글 정보
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
        user_img_url : user_img_url,
        alarmcnt : pushcntQuery[0].pushcnt,
        content : result
      }
    });

  }catch(err){
    console.error(err);
    return next("500");
  }
});



/*  커뮤니티 게시글 작성하기  */
/*  /board  */
router.post('/', upload.array('image'), async(req, res, next) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    var userid = chkToken.id;
    let content, image;
    let shared = req.body.shared;

    // 따옴표 제거 for android
    if (req.useragent.isAndroid && req.body.content){
      content = req.body.content;
      content = content.substr(1, content.length-2)
    } else {
      content = ""
    }


    if (req.files[0]){
      image = req.files[0].location;
    } else {
      image = "0"
    }

    let postboardQuery =
    `
    INSERT INTO
    myjungnami.board (b_user_id, content, img_url, shared)
    VALUES (?, ?, ?, ?)
    `;
    let data = await db.queryParamCnt_Arr(postboardQuery, [userid, content, image, shared]);
    if(!data){
      console.log(err);
      return next("500");
    }

    res.status(201).send({
      "message" : "Success",
    });
  }catch(err){
    console.log(err);
    return next("500");
  }
});



/*  커뮤니티 게시글 삭제하기  */
/*  /board/:boardid  */
router.delete('/:boardid',  async (req, res, next) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let u_id = chkToken.id;
    let b_id = req.params.boardid;

    let boardSql =
    `
    SELECT b_user_id
    FROM board
    WHERE id = ?
    `;
    let boardQuery = await db.queryParamCnt_Arr(boardSql, [b_id]);

    if (u_id == boardQuery[0].b_user_id) { // 내가 작성한 글 맞으니까, 삭제 진행 하세요
      let deleteboardSql =
      `
      DELETE
      FROM board
      WHERE id = ?
      `;

      // 해당 글을 공유한 글도 함께 삭제
      let deleteboardsharedSql =
      `
      DELETE
      FROM board
      WHERE shared = ?
      `;

      let Transaction = await db.Transaction( async (connection) => {
        let deleteboardQuery = await connection.query(deleteboardSql, [b_id]);
        if(!deleteboardQuery){
          console.log(err);
          return next("500");
        }

        let deleteboardsharedQuery = await connection.query(deleteboardsharedSql, [b_id]);
        if(!deleteboardQuery){
          console.log(err);
          return next("500");
        }
      });

      if(!Transaction){
        console.log(err);
        return next("500");
      }
      
    }
    else{
      return next("401");
    }

		res.status(200).send({
			"message" : "Success"
	 	});
  }catch(err){
  	console.log(err);
    return next("500");
  }
});


/*  커뮤니티 게시글 리스트 검색결과 보여주기  */
/*  /board/search/:keyword  */
router.get('/search/:keyword', async(req, res, next) => {

  var user_id; 

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    user_id = "";
  }
  else{
    id = chkToken.id;
  }


  // 자음, 모음까지 검색 되도록 하기 위해 사용
  let searchWord = req.params.keyword;
  let searcher = new hangul.Searcher(searchWord);

  try{
    let select_content =
    `
    SELECT board.id as id, user.id as user_id, nickname, user.img_url as user_img_url, content, writingtime, board.img_url as img_url
    FROM board
    JOIN user
    ON board.b_user_id = user.id
    ORDER BY writingtime DESC
    `;
    let result_content = await db.queryParamCnt_Arr(select_content);

    // 좋아요한 글 가져오기
    var select_check =
    `
    SELECT bl_board_id
    FROM boardLike
    WHERE bl_user_id = ?
    `
    var result_check = await db.queryParamCnt_Arr(select_check, [user_id]);

    // return할 result
    var result = [];
    for(var i=0; i<result_content.length; i++){
      var data = {};
      if(searcher.search(result_content[i].content) >= 0){
        // id
        data.id = result_content[i].id;

        // 유저 정보
        data.user_id = result_content[i].user_id;
        data.nickname = result_content[i].nickname;
        data.user_img_url = result_content[i].user_img_url;

        // 내용
        data.content = result_content[i].content;
        data.img_url = result_content[i].img_url;

        // 좋아요 여부
        data.islike = 0;
        for(var j=0; j<result_check.length; j++){
          if(result_check[j].bl_board_id == result_content[i].id){
            data.islike = 1;
            break;
          }
        }

        // 시간 계산
        // 작성 10분 이내
        var writingtime = result_content[i].writingtime;
        data.writingtime = checktime.checktime(writingtime);

        // 좋아요 수
        let select_like =
        `
        SELECT *
        FROM boardLike
        WHERE bl_board_id = ?
        `;
        let result_like = await db.queryParamCnt_Arr(select_like, result_content[i].id);
        data.likecnt = result_like.length;

        // 댓글 수
        let select_comment =
        `
        SELECT *
        FROM boardComment
        WHERE bc_board_id = ?
        `;
        let result_comment = await db.queryParamCnt_Arr(select_comment, result_content[i].id);
        data.commentcnt = result_comment.length;

        result.push(data);
      }
    }

    if(result.length == 0){
      return next("1204");
    }

    res.status(200).json({
      message : "Success",
      data : result
    });

  }catch(error) {
    return next("500");
  }
});



module.exports = router;
