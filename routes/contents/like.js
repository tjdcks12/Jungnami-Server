//컨텐츠 좋아요 -ok
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.post('/', async(req, res) => {
	var id; // 사용자 email
	
  	const chkToken = jwt.verify(req.headers.authorization);

  	if(chkToken == -1) {
    	id = "";
  	}
  	else{
    	id = chkToken.id;
  	}

	try{
		//로그인 했을 때만 할 수 있게 
		if(id == ""){
			res.status(401).send({
				message : "Access Denied"
			});
		}
		//로그인 시 좋아요 처리 
		else{
			if(!(req.body.cl_contents_id && req.body.cl_user_id)){
				res.status(403).send({
					message : "please input contents_id and user_id"
				});
			}else{
				let postcontentslikeQuery = 'INSERT INTO myjungnami.contentsLike(id, cl_contents_id, cl_user_id) VALUES (null, ?, ?)';
				let data = await db.queryParamCnt_Arr(postcontentslikeQuery, [req.body.cl_contents_id, req.body.cl_user_id]);

				res.status(200).send({
					"message" : "insert contentslike success",
					"data" : data
				});

				console.log(data);
			}
			
		}
	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "syntax error"
		});
	}
})

module.exports = router;