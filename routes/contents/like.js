/*  컨텐츠 글 좋아요  */
/*  /contents/like  */

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  컨텐츠 글 좋아요 하기  */
/*  /contents/like  */
router.post('/', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{ 

		let postcontentslikeQuery =
		`
		INSERT INTO
		myjungnami.contentsLike(id, cl_contents_id, cl_user_id)
		VALUES (null, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(postcontentslikeQuery, [req.body.contents_id, userid]);
		if(!data){
			console.log(err);
			return next("500");
		}

		res.status(201).send({
			"message" : "Success"
		});



	}catch(err){
		console.log(err);
		return next("500");
	}
});


/*  컨텐츠 글 좋아요 취소하기  */
/*  /contents/like/:contentsid  */
router.delete('/:contentsid', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);
  
	if(chkToken == -1) {
	  return next("401");
	}
  
	let userid = chkToken.id;
  
	try{
		let delete_like =
		`
		DELETE
		FROM contentsLike
		WHERE cl_contents_id = ? AND cl_user_id = ?
		`;
		let result_delete = await db.queryParamCnt_Arr(delete_like,[req.params.contentsid, userid]);
		if(!result_delete){
			console.log(err);
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
