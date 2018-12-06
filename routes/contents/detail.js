/*  컨텐츠 글 상세보기  */
/*  /contents/detail  */
/*  안써  */

var express = require('express');
var router = express.Router();
// var router = express.Router({mergeParams : true});
const async = require('async');
const db = require('../../module/pool.js');

const jwt = require('../../module/jwt.js');


/*  /contents/detail/:contents_id  */
router.get('/:contents_id',  async (req, res, next) => {

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
