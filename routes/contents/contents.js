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
  if(pre == 0){
    pre = 100000000;
  }
  
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

    // 컨텐츠 다가져오기 ( score desc ) ?? 다시!!!!
    var select_contents =
    `
    SELECT *
    FROM contents
    WHERE id < ?
    ORDER BY id DESC
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
router.get('/category/:category/:pre', async (req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
  }

  let pre =+ req.params.pre;  // contentsid
  if(pre == 0){
    pre = 100000000;
  }

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

    // 컨텐츠 다가져오기 ( score desc ) ?? 다시@!!!
    var select_contents =
    `
    SELECT *
    FROM contents
    WHERE category = ?
    AND id < ?
    ORDER BY id DESC
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





/*  컨텐츠 글 상세보기  */
/*  /contents/:contents_id/detail  */
router.get('/:contents_id/detail',  async (req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  let u_id;

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id;
  }

  try{
    let contents_id =+ req.params.contents_id;
    let resultdata = new Object();

    //컨텐츠물 작성시간, 카테고리
    let getcontentinfoQuery =
    `
    select *
    from myjungnami.contents
    where id = ?
    `;
    let contentsinfo = await db.queryParamCnt_Arr(getcontentinfoQuery, [contents_id]);

    //카드뉴스 이미지 배열
    let getcardnewsQuery =
    `
    select img_url
    from myjungnami.contentsImg
    where ci_contents_id = ?
    `;
    let imageArry = await db.queryParamCnt_Arr(getcardnewsQuery, [contents_id]);

    //컨텐츠물 좋아요 개수
    let getlikecntQuery =
    `
    select count(*) as likecnt
    from myjungnami.contentsLike
    where cl_contents_id = ?
    `;
    let contentslikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [contents_id]);

    //컨텐츠물 댓글 갯수
    let getcommentcntQuery =
    `
    select count(*) as commentcnt
    from myjungnami.contentsComment
    where cc_contents_id = ?
    `;
    let contentscommentCnt = await db.queryParamCnt_Arr(getcommentcntQuery, [contents_id]);

    // 내가 스크랩한 글 가져오기
    let check_scrap =
    `
    SELECT s_contents_id
    FROM scrap
    WHERE s_user_id = ?
    `;
    let check_result = await db.queryParamCnt_Arr(check_scrap, [u_id]);

    // 해당 컨텐츠 스크랩 여부
    resultdata.isscrap = 0;
    for(var j=0; j<check_result.length; j++){
      if(check_result[j].s_contents_id == contentsinfo[0].id){
        resultdata.isscrap = 1;
        break;
      }
    }
    
    resultdata.title = contentsinfo[0].title;
    resultdata.thumbnail = contentsinfo[0].thumbnail_url;
    resultdata.text = contentsinfo[0].category + " · " + contentsinfo[0].writingtime.toLocaleString();
    resultdata.subtitle = contentsinfo[0].subtitle;

    resultdata.type = contentsinfo[0].contents_type; // type검사 : 동영상(1) or cardnews(0)
    resultdata.imagearray = imageArry;
    resultdata.youtube = contentsinfo[0].youtube_url;

    resultdata.likeCnt = contentslikeCnt[0].likecnt;
    resultdata.commentCnt = contentscommentCnt[0].commentcnt;


    // 내가 좋아요한 글 가져오기
    var select_like =
    `
    SELECT cl_contents_id
    FROM contentsLike
    WHERE cl_user_id = ?
    `
    var result_like = await db.queryParamCnt_Arr(select_like, [u_id]);

    // 좋아요 여부
    resultdata.islike = 0;
    for(var j=0; j<result_like.length; j++){
      if(result_like[j].cl_contents_id == contentsinfo[0].id){
        resultdata.islike = 1;
        break;
      }
    }

    // 조회 수 증가
    var update_views =
    `
    UPDATE contents
    SET views = views + 1
    WHERE id = ?
    `;
    var result_views = await db.queryParamCnt_Arr(update_views, [contents_id]);

    res.status(200).send({
      "message" : "Success",
      "data" : resultdata
    });

  }catch(err){
    return next("500");
  }
});
module.exports = router;
