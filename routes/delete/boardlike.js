/* board 좋아요 취소 */

/* 종찬 */


var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.delete('/:boardid', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    return next("401");
  }

  let userid = chkToken.id;

  try{
    let delete_like =
    `
    DELETE
    FROM boardLike
    WHERE bl_board_id = ? AND bl_user_id = ?
    `;
    let result_delete = await db.queryParamCnt_Arr(delete_like,[req.params.boardid, userid]);
    if(!result_delete){
      return next("500");
    }

    res.status(200).send({
      "message" : "Success"
    });

  }catch(err){
		console.log(err);
    return next("500");
	}

});

module.exports = router;
