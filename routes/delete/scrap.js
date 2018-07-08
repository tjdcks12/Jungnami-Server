
var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');


/*  스크랩 삭제  */
/*  /delete/scrap  */
router.delete('/:scrapid',  async (req, res) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
        return;
    }

    let userid = chkToken.id;

    let select_userid= 'SELECT * FROM scrap WHERE id = ?';
    let result_userid = await db.queryParamCnt_Arr(select_userid, [req.params.scrapid]);

    if (userid == result_userid[0].s_user_id) { // 내가 작성한 글 맞으니까, 삭제 진행 하세요

      let deleteboardSql = 'DELETE FROM scrap WHERE id = ?';
      let deleteboardQuery = await db.queryParamCnt_Arr(deleteboardSql, [req.params.scrapid]);
      if(deleteboardQuery <= 0){
        res.status(204).send({
          "message" : "No data"
        });

        return;
      }
    }
    else{
      res.status(401).send({
        "message" : "Different User"
      });
    }

		res.status(200).send({
			"message" : "Successfully delete"
	 	});


  }catch(err){
  	console.log(err);
  	res.status(500).send({
  		"message" : "Internal Server Error"
  	});
  }
});

module.exports = router;
