/* board 댓글 삭제 */

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
    // board comment 정보 가져오기
    let select_comment = 'SELECT * FROM boardComment WHERE id = ?';
    let result_comment = await db.queryParamCnt_Arr(select_comment,[req.params.boardcommentid]);

    // id 비교
    if(userid == result_comment[0].bc_user_id){
      let delete_comment = 'DELETE FROM boardComment WHERE id = ?';
      let result_delete = await db.queryParamCnt_Arr(delete_comment,[req.params.boardcommentid]);
      if(result_delete <= 0){
        res.status(204).send({
          "message" : "No data"
        });

        return;
      }

      res.status(200).send({
        "message" : "Successfully delete"
      });
    }
    else{
      res.status(401).send({
        "message" : "Different User"
      });
    }
  }catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "syntax error"
		});
	}

});

module.exports = router;
