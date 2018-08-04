/* contents 대댓글 삭제 */

/* 종찬 */


var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.delete('/:contentsrecommentid', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    return next("401");
  }

  let userid = chkToken.id;

  try{
    // contents comment 정보 가져오기
    let select_comment =
    `
    SELECT *
    FROM contentsRecomment
    WHERE id = ?
    `;
    let result_comment = await db.queryParamCnt_Arr(select_comment,[req.params.contentsrecommentid]);

    // id 비교
    if(userid == result_comment[0].cr_user_id){
      let delete_comment =
      `
      DELETE
      FROM contentsRecomment
      WHERE id = ?
      `;
      let result_delete = await db.queryParamCnt_Arr(delete_comment,[req.params.contentsrecommentid]);
      if(!result_delete){
        return next("500");
      }

      res.status(200).send({
        "message" : "Success"
      });
    }
    else{
      return next("401");
    }
  }catch(err){
		console.log(err);
    return next("500");
	}

});

module.exports = router;
