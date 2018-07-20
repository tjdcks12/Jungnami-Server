
var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');


/*  스크랩 삭제  */
/*  /delete/scrap  */
router.delete('/:contentsid',  async (req, res) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
        // res.status(401).send({
        //     message : "Access Denied"
        // });
        // return;
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

        break;
      }
    }

		res.status(200).send({
			"message" : "Success"
	 	});


  }catch(err){
  	console.log(err);
    return next("501");
  	// res.status(500).send({
  	// 	"message" : "Internal Server Error"
  	// });
  }
});

module.exports = router;
