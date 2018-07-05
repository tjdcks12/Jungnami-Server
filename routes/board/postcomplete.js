//커뮤니티 글 작성 완료 버튼 눌렀을 때 작성 완료 - OK 
//(board 테이블에 작성자 user_id unique 풀어줘야 함 )
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
	try{
		if(!(req.body.b_user_id && req.body.content && req.body.shared)){
			res.status(403).send({
				message : "please input b_user_id and content and shared"
			});
		}else{
			let postboardQuery = 'INSERT INTO myjungnami.board(id, b_user_id, content, img_url, shared) VALUES (null, ?, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(postboardQuery, [req.body.b_user_id, req.body.content, req.body.img_url, req.body.shared]);

			res.status(200).send({
				"message" : "insert posting success",
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