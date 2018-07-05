//게시글의 특정 댓글 -> 댓글의 대댓글 리스트 보여주기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.get('/:c_id', async(req, res) => {
	try{
		if(!(req.params.c_id)){
			res.status(403).send({
				message : "please input comment_id"
			});
		}else{
			let getrecommentlistQuery = 'select * from myjungnami.boardRecomment where br_boardComment_id = ? ';
			let data = await db.queryParamCnt_Arr(getrecommentlistQuery, [req.params.c_id]);

			res.status(200).send({
				"message" : "Successfully get board recomment",
				"data" : data
			});

			console.log(data);
		}
	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "syntax error"
		});
	}
})

module.exports = router;