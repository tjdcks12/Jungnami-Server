//컨텐츠 탭 메인화면 cate 별로 뿌러주기 , cate default -> 추천
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

router.get('/', async (req, res) => {

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
    let pushcntSql = "SELECT count(*) as pushcnt FROM push WHERE p_user_id = ? AND ischecked = false"
    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);

    // 컨텐츠 다가져오기 ( score desc )
    var select_contents = 'SELECT * FROM contents ORDER BY score DESC';
    var result_contents = await db.queryParamCnt_Arr(select_contents, [req.params.category]);
    if(result_contents.length == 0){
      res.status(300).send({
        "message" : "NO data"
      });

      return;
    }

    var result = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " * " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      result.push(data);
    }

    res.status(200).send({
      "message" : "Successfully get posting view",
      "data" : {
        content : result,
        alarmcnt : pushcntQuery[0].pushcnt
      }
    });

  }catch(err){
    console.log(err);
    res.status(500).send({
      "message" : "Server error"
    });
  }
});

module.exports = router;