//커뮤니티 글에 달린 댓글 리스트 보여주기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.get('/:bc_board_id', async(req, res) => {
	try{
		if(!(req.params.bc_board_id)){
			res.status(403).send({
				message : "please input bc_board_id"
			});
		}else{
			let getcommentlistQuery = 'select * from myjungnami.boardComment where bc_board_id = ? ';
			let data = await db.queryParamCnt_Arr(getcommentlistQuery, [req.params.bc_board_id]);

			res.status(200).send({
				"message" : "Successfully get board comment list",
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