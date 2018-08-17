/*  컨텐츠 스크랩  */
/*  /user/scrap  */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');


// contents/scrap
/*  컨텐츠 스크랩하기  */
/*  /user/scrap  */
router.post('/',  async (req, res, next) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let userid = chkToken.id;

    let insert_scrap =
    `
    INSERT INTO
    scrap (s_contents_id, s_user_id)
    VALUES (?,?)
    `
    let result_scrap = await db.queryParamCnt_Arr(insert_scrap,[req.body.contentsid, userid]);
    if(!result_scrap){
      return next("500");
    }

		res.status(201).send({
			"message" : "Success"
	 	});


  }catch(err){
  	console.log(err);
    return next("500");
  }
});




// delete/scrap
/*  컨텐츠 스크랩 삭제  */
/*  /user/scrap/:contentsid  */
router.delete('/:contentsid',  async (req, res, next) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let userid = chkToken.id;


    // 내가 스크랩한 모든 컨텐츠 글
    let select_contentsid =
    `
    SELECT *
    FROM scrap
    WHERE s_user_id = ?
    `;
    let result_contentsid = await db.queryParamCnt_Arr(select_contentsid, [userid]);

    for(var i=0; i<result_contentsid.length; i++){

      if (req.params.contentsid == result_contentsid[i].s_contents_id) { // 내가 스크랩한 글 스크랩 취소하세요

        let deleteboardSql =
        `
        DELETE
        FROM scrap
        WHERE id = ?
        `;
        let deleteboardQuery = await db.queryParamCnt_Arr(deleteboardSql, [result_contentsid[i].id]);
        if(!deleteboardQuery){
          return next("500");
        }

        break;
      }
    }

		res.status(200).send({
			"message" : "Success"
	 	});


  }catch(err){
  	console.log(err);
    return next("501");
  }
});

module.exports = router;
