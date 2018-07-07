/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');


/*  컨텐츠 게시글 삭제하기  */
/*  /contents/c_delete  */
router.post('/',  async (req, res) => {
  try{

    let c_id = req.body.contents_id;

    let deletecontentsSql = 'DELETE FROM cotents WHERE id = ?';
    let deletecontentsQuery = await db.queryParamCnt_Arr(deletecontentsSql, [c_id]);

    // 해당 컨텐츠를 스크랩한 것도 함께 삭제
    let deletecotentsscrapsharedSql = 'DELETE FROM scrap WHERE s_contents_id = ?';
    let deletecotentsscrapQuery = await db.queryParamCnt_Arr(deletecotentsscrapsharedSql, [c_id]);

		res.status(201).send({
			"message" : "Successfully delete contents posting"
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
// router.use('/c_delete', require('./c_delete'));


