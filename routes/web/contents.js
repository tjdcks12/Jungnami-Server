/*  웹용 - 컨텐츠 글 등록하기 / 가져오기  */
/*  /web/contents  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents_img.js');

const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');


// contents/post
/*  관리자가 컨텐츠 글을 게시하기  */
/*  /web/contents  */
router.post('/', upload.fields([{name : 'thumbnail', maxCount : 1}, {name : 'cardnews', maxCount : 50}]), async(req, res, next) => {
  try{
    let title = req.body.title;
    let subtitle = req.body.subtitle;
    let contents_type = req.body.contents_type;
    let category = req.body.category;


    let thumbnail, cardnews, youtubelink;
    if (req.files.thumbnail){
      thumbnail = req.files.thumbnail[0].location;
    } else {
      thumbnail = null;
    }


    // content table에 thumbnail 저장
    var postSql =
    `
    INSERT INTO
    contents (title, subtitle, thumbnail_url, category, contents_type)
    VALUES (?, ?, ?, ?, ?);
    `;
    var postResult = await db.queryParamCnt_Arr(postSql,[title, subtitle, thumbnail, category, contents_type]);
    if(!postResult){
      return next("500");
    }

    let c_id = postResult.insertId;

    // contentImg table에 cardnews 저장
    if (req.files.cardnews){

      cardnews = req.files.cardnews;

      let insertcardnewsSql =
      `
      INSERT INTO
      contentsImg (ci_contents_id, img_url)
      VALUES (?,?)
      `;
      for(var i=0; i<cardnews.length; i++){
        let insertcardnewsQuery = await db.queryParamCnt_Arr(insertcardnewsSql,[c_id, cardnews[i].location]);
      }
    }

    // content table에 youtubelink 삽입
    if (req.body.youtubelink){
      youtubelink = req.body.youtubelink;

      let insertyoutubelinkSql =
      `
      UPDATE contents
      SET youtube_url = ?
      WHERE id = ?;
      `
      let insertyoutubelinkQuery = await db.queryParamCnt_Arr(insertyoutubelinkSql,[youtubelink, c_id]);
    }

    // hash table에 c_id, l_id 저장
    let l_id = []; // array

    if(req.body.l_id == undefined) { // wrong input
      l_id = [];
    } else if (typeof(req.body.l_id) == typeof(l_id)){ // array
      l_id = req.body.l_id;
    } else {
      l_id.push(req.body.l_id);
    }

    for (var i=0; i<l_id.length; i++) {
      var hashSql =
      `
      INSERT INTO
      hash (h_contents_id, h_legislator_id)
      VALUES (?, ?);
      `;
      var hashQuery = await db.queryParamCnt_Arr(hashSql, [c_id, l_id[i]]);
    }

    res.status(201).send({
      message : "Success"
    });

  } catch (error) {
    return next("500");
  }
});




// contents/recommendforweb
/*  컨텐츠 글 가져오기 (best + story + tmi 20개씩)  */
/*  /web/contents  */
router.get('/', async (req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
  }

  try{
    // 푸쉬알람 카운트 가져오기
    let pushcntSql =
    `
    SELECT count(*) as pushcnt
    FROM push
    WHERE p_user_id = ? AND ischecked = false
    `
    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);

    // 추천 컨텐츠 다가져오기
    var select_contents =
    `SELECT *
    FROM contents
    ORDER BY score DESC
    LIMIT 20
    `
    var result_contents = await db.queryParamCnt_Arr(select_contents);

    var recommend = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};
      // id
      data.contentsid = result_contents[i].id;

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      recommend.push(data);
    }

    // TMI 가져오기
    select_contents =
    `
    SELECT *
    FROM contents
    WHERE category = 'TMI'
    ORDER BY writingtime DESC
    LIMIT 20
    `
    result_contents = await db.queryParamCnt_Arr(select_contents);

    var tmi = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};
      // id
      data.contentsid = result_contents[i].id;

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      tmi.push(data);
    }

    // 스토리 가져오기
    select_contents =
    `
    SELECT *
    FROM contents
    WHERE category = '스토리'
    ORDER BY writingtime DESC
    LIMIT 20
    `
    result_contents = await db.queryParamCnt_Arr(select_contents);

    var story = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};
      // id
      data.contentsid = result_contents[i].id;

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      story.push(data);
    }


    res.status(200).send({
      "message" : "Success",
      "data" : {
        recommend : recommend,
        tmi : tmi,
        story : story,
        alarmcnt : pushcntQuery[0].pushcnt
      }
    });

  }catch(err){
    return next("500");
  }
});


module.exports = router;
