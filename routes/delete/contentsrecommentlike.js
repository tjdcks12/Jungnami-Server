/* contents 대댓글 좋아요 취소 */

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
      // res.status(401).send({
      //     message : "Access Denied"
      // });
      // return;
  }

  try{
    let delete_like =
    `
    DELETE
    FROM contentsRecommentLike
    WHERE crl_contentsRecomment_id = ? AND crl_user_id = ?
    `;
    let result_delete = await db.queryParamCnt_Arr(delete_like,[req.params.contentsrecommentid, userid]);

    res.status(200).send({
      "message" : "Success"
    });

  }catch(err){
		console.log(err);
    return next("500");
		// res.status(500).send({
		// 	"message" : "syntax error"
		// });
	}

});

module.exports = router;
