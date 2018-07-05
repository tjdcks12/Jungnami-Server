//커뮤니티 글에 좋아요 눌렀을 때  -> OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
	try{
		if(!(req.body.bl_board_id && req.body.bl_user_id)){
			res.status(403).send({
				message : "please input board_id and user_id"
			});
		}else{
			let postboardlikeQuery = 'INSERT INTO myjungnami.boardLike(id, bl_board_id, bl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(postboardlikeQuery, [req.body.bl_board_id, req.body.bl_user_id]);


			res.status(200).send({
				"message" : "insert boardlike success",
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