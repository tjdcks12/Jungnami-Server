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
      res.status(401).send({
          message : "Access Denied"
      });
      return;
  }

  let userid = chkToken.id;

  try{
    let delete_like = 'DELETE FROM boardLike WHERE bl_board_id = ? AND bl_user_id = ?';
    let result_like = await db.queryParamCnt_Arr(delete_like,[req.params.boardid, userid]);
    if(result_like <= 0){
      res.status(204).send({
        "message" : "No data"
      });

      return;
    }

    res.status(200).send({
      "message" : "Successfully cancel"
    });

  }catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "syntax error"
		});
	}

});

module.exports = router;
