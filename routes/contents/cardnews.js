//컨텐츠물 클릭시 카드뉴스 시작 화면
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

//contents에서 받아오는 id 로  title좋아요 수 , 댓글 수, 시간, cate
//contents_id로 contentsimg 테이블에서 사진 20개 받아오기

router.get('/:contents_id',  async (req, res) => {


  const chkToken = jwt.verify(req.headers.authorization);

  let u_id;

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id;
  }

  try{
    if(!(req.params.contents_id)){
      res.status(403).send({
        "message" : "please input contents' id"
      });
    }else{
      let resultdata = new Object();

      //컨텐츠물 작성시간, 카테고리
      let getcontentinfoQuery = 'select * from myjungnami.contents where id = ?';
      let contentsinfo = await db.queryParamCnt_Arr(getcontentinfoQuery, [req.params.contents_id]);
      if(contentsinfo.length == 0){
        res.status(300).send({
          "message" : "NO data"
        });

        return;
      }

      //카드뉴스 이미지 배열
      let getcardnewsQuery = 'select img_url from myjungnami.contentsImg where ci_contents_id = ?';
      let imageArry = await db.queryParamCnt_Arr(getcardnewsQuery, [req.params.contents_id]);

      //컨텐츠물 좋아요 개수
      let getlikecntQuery = 'select count(*) as likecnt from myjungnami.contentsLike where cl_contents_id = ?';
      let contentslikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [req.params.contents_id]);
      if(contentslikeCnt.length == 0){
        res.status(300).send({
          "message" : "NO data"
        });

        return;
      }

      //컨텐츠물 댓글 갯수
      let getcommentcntQuery = 'select count(*) as commentcnt from myjungnami.contentsComment where cc_contents_id = ?';
      let contentscommentCnt = await db.queryParamCnt_Arr(getcommentcntQuery, [req.params.contents_id]);
      if(contentscommentCnt.length == 0){
        res.status(300).send({
          "message" : "NO data"
        });

        return;
      }

      // 컨텐츠 스크랩 여부
      let check_scrap = 'SELECT count(*) AS scrap FROM scrap WHERE s_contents_id = ? AND s_user_id = ?';
      let check_result = await db.queryParamCnt_Arr(check_scrap, [req.params.contents_id ,u_id]);
      console.log(check_result[0].scrap);
      if(check_result[0].scrap == 0){
        resultdata.isscrap = 0;
      }
      else{
        resultdata.isscrap = 1;
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
      var select_like = 'SELECT cl_contents_id FROM contentsLike WHERE cl_user_id = ?'
      var result_like = await db.queryParamCnt_Arr(select_like, [u_id]);

      // 좋아요 여부
      resultdata.islike = 0;
      for(var j=0; j<result_like.length; j++){
        if(result_like[j].cl_contents_id == contentsinfo[0].id){
          resultdata.islike = 1;
          break;
        }
      }

      var update_views = 'UPDATE contents SET views = views + 1 WHERE id = ?';
      var result_views = await db.queryParamCnt_Arr(update_views, [req.params.contents_id]);
      if(result_views <= 0){
        res.status(204).send({
          "message" : "No data"
        });

        return;
      }

      res.status(200).send({
        "message" : "Successfully get posting view",
        "data" : resultdata
      });
    }

  }catch(err){

    console.log(err);
    res.status(500).send({
      "message" : "Server error"
    });
  }
});

module.exports = router;
