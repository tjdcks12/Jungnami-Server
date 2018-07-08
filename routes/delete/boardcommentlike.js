/* board 댓글 좋아요 취소 */

/* 종찬 */


var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.delete('/:boardcommentid', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
      res.status(401).send({
          message : "Access Denied"
      });
      return;
  }

  let userid = chkToken.id;

  try{
    let delete_like = 'DELETE FROM boardCommentLike WHERE bcl_boardComment_id = ? AND bcl_user_id = ?';
    let result_like = await db.queryParamCnt_Arr(delete_like,[req.params.boardcommentid, userid]);
    if(result_like <= 0){
      res.status(204).send({
        "message" : "No data"
      });

      return;
    }


    if(result_delete <= 0){
      res.status(204).send({
        "message" : "No data"
      });
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
