//컨텐츠물 클릭시 카드뉴스 시작 화면 
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

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
        let getcontentinfoQuery = 'select title, writingtime, category from myjungnami.contents where id = ?';
        let contentsinfo = await db.queryParamCnt_Arr(getcontentinfoQuery, [req.params.contents_id]);
        console.log(contentsinfo);

      	//카드뉴스 이미지 배열 
        let getcardnewsQuery = 'select * from myjungnami.contentsImg where ci_contents_id = ?';
        let imageArry = await db.queryParamCnt_Arr(getcardnewsQuery, [req.params.contents_id]);
        console.log(imageArry);	

        //컨텐츠물 좋아요 개수
        let getlikecntQuery = 'select count(*) from myjungnami.contentsLike where cl_contents_id = ?';
        let contentslikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [req.params.contents_id]);
        console.log(contentslikeCnt);

        //컨텐츠물 댓글 갯수 
        let getcommentcntQuery = 'select count(*) from myjungnami.contentsComment where cc_contents_id = ?';
        let contentscommentCnt = await db.queryParamCnt_Arr(getcommentcntQuery, [req.params.contents_id]);
        console.log(contentscommentCnt);

        resultdata.info = contentsinfo;
        resultdata.imagearry = imageArry;
        resultdata.likeCnt = contentslikeCnt;
        resultdata.commentCnt = contentscommentCnt;


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
