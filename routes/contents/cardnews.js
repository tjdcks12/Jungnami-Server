//컨텐츠물 클릭시 카드뉴스 시작 화면
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const checktime = require('../../module/checktime.js');

//contents에서 받아오는 id 로  title좋아요 수 , 댓글 수, 시간, cate
//contents_id로 contentsimg 테이블에서 사진 20개 받아오기

router.get('/:contents_id',  async (req, res) => {
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
      let getcardnewsQuery = 'select img_url, ord from myjungnami.contentsImg where ci_contents_id = ? ORDER BY ord';
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


      resultdata.title = contentsinfo[0].title;
      resultdata.thumbnail = contentsinfo[0].thumbnail_url;
      resultdata.writingtime = contentsinfo[0].writingtime.toLocaleString();
      resultdata.subtitle = contentsinfo[0].subtitle;

      resultdata.type = contentsinfo[0].contents_type; // type검사 : 동영상(1) or cardnews(0)
      resultdata.imagearary = imageArry;
      resultdata.youtube = contentsinfo[0].youtube_url;

      resultdata.likeCnt = contentslikeCnt[0].likecnt;
      resultdata.commentCnt = contentscommentCnt[0].commentcnt;

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
