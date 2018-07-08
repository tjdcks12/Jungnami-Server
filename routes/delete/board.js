/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');


/*  커뮤니티 게시글 삭제하기  */
/*  /board/b_delete  */
router.delete('/:boardid',  async (req, res) => {
  try{

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
        return;
    }

    let u_id = chkToken.id;
    let b_id = req.params.boardid;

    let boardSql = 'SELECT b_user_id FROM board WHERE id = ?';
    let boardQuery = await db.queryParamCnt_Arr(boardSql, [b_id]);

    if (u_id == boardQuery[0].b_user_id) { // 내가 작성한 글 맞으니까, 삭제 진행 하세요

      let deleteboardSql = 'DELETE FROM board WHERE id = ?';
      let deleteboardQuery = await db.queryParamCnt_Arr(deleteboardSql, [b_id]);
      if(deleteboardQuery <= 0){
        res.status(204).send({
          "message" : "No data"
        });

        return;
      }

      // 해당 글을 공유한 글도 함께 삭제
      let deleteboardsharedSql = 'DELETE FROM board WHERE shared = ?';
      let deleteboardsharedQuery = await db.queryParamCnt_Arr(deleteboardsharedSql, [b_id]);
    }
    else{
      res.status(401).send({
        "message" : "Different User"
      });
    }

		res.status(200).send({
			"message" : "Successfully delete board posting"
	 	});


  }catch(err){
  	console.log(err);
  	res.status(500).send({
  		"message" : "Internal Server Error"
  	});
  }
});

module.exports = router;


// routes 에 추가해야 함
// router.use('/b_delete', require('./b_delete'));
