
		//커뮤니티 글에 좋아요 눌렀을 때  -> 로그인 처리까지  OK
		var express = require('express');
		var router = express.Router();
		const async = require('async');
		const db = require('../../module/pool.js');
		const jwt = require('../../module/jwt.js');


		router.post('/', async(req, res) => {
			var id; // 사용자 email
			
			const chkToken = jwt.verify(req.headers.authorization);

			if(chkToken == -1) {
				res.status(401).send({
					message : "Access Denied"
				});

				return;
			}


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

					var pushmsg = (req.body.bl_user_id = '님이 회원님의 글을 좋아합니다.');

				}

			}catch(err){
				console.log(err);
				res.status(500).send({
					"message" : "syntax error"
				});
			}
		});

		module.exports = router;