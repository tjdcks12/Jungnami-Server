/*  컨텐츠 글  */
/*  /contents  */

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');
const hangul = require('hangul-js');


/*  컨텐츠 글 (추천)  */
/*  /contents/:pre  */
router.get('/:pre', async (req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
  }

  let pre =+ req.params.pre;  // contentsid
  // if(pre == 0){
  //   pre = 100000000;
  // }
  
  let number = 10;

  try{
    // 푸쉬알람 카운트 가져오기
    let pushcntSql =
    `
    SELECT count(*) as pushcnt
    FROM push
    WHERE p_user_id = ? AND ischecked = false
    `
    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);

    // 컨텐츠 다가져오기 ( score desc )
    var select_contents =
    `
    SELECT *
    FROM contents
    WHERE id > ?
    ORDER BY score DESC
    `
    var result_contents = await db.queryParamCnt_Arr(select_contents, [pre]);

    var result = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};

      if(number <= 0)
        break;
      // else if(result_contents[i].id >= pre)
      //   continue;

      number--;

      data.contentsid = result_contents[i].id;
      data.title = result_contents[i].title;
      data.thumbnail = result_contents[i].thumbnail_url;
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      result.push(data);
    }

    res.status(200).send({
      "message" : "Success",
      "data" : {
        alarmcnt : pushcntQuery[0].pushcnt,
        content : result
      }
    });

  }catch(err){
    return next("500");
  }
});


/*  컨텐츠 글 (TMI, story)  */
/*  /contents/category/:category/:pre  */
router.get('/:category/:pre', async (req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
  }

  let pre =+ req.params.pre;  // contentsid
  // if(pre == 0){
  //  let pre = 100000000;
  // }

  let number = 10;

  try{
    // 푸쉬알람 카운트 가져오기
    let pushcntSql =
    `
    SELECT count(*) as pushcnt
    FROM push
    WHERE p_user_id = ? AND ischecked = false
    `
    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);

    // 컨텐츠 다가져오기 ( score desc )
    var select_contents =
    `
    SELECT *
    FROM contents
    WHERE category = ?
    AND id > ?
    ORDER BY writingtime DESC
    `;
    var result_contents = await db.queryParamCnt_Arr(select_contents, [req.params.category, pre]);

    var result = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};

      if(number <= 0)
        break;
      // else if(result_contents[i].id >= pre)
      //   continue;

      number--;

      data.contentsid = result_contents[i].id;
      data.title = result_contents[i].title;
      data.thumbnail = result_contents[i].thumbnail_url;
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      result.push(data);
    }

    res.status(200).send({
      "message" : "Success",
      "data" : {
        alarmcnt : pushcntQuery[0].pushcnt,
        content : result
      }
    });

  }catch(err){
    return next("500");
  }
});


/*  컨텐츠 글 검색결과 보여주기  */
/*  /contents/search/:keyword  */
router.get('/search/:keyword', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
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
    SELECT *
    FROM contents
    ORDER BY score DESC
    `;
    let result_content = await db.queryParamCnt_Arr(select_content);

    // return할 result
    var result = [];
    for(var i=0; i<result_content.length; i++){
      var data = {};
      if(searcher.search(result_content[i].title) >= 0){

        data.contentsid = result_content[i].id;
        data.title = result_content[i].title;
        data.thumbnail = result_content[i].thumbnail_url;
        data.text = result_content[i].category + " · " + checktime.checktime(result_content[i].writingtime);

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
