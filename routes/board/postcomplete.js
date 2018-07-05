//커뮤니티 글 작성 완료 버튼 눌렀을 때 작성 완료 - OK 
//(board 테이블에 작성자 user_id unique 풀어줘야 함 )
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

aws.config.loadFromPath('../config/aws_config.json');

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'myrubysbucket',
        acl: 'public-read',
        key: function(req, file, cb) {
            cb(null, Date.now() + '.' + file.originalname.split('.').pop());
        }
    })
});

router.post('/', upload.array('image'), async(req, res) => {
	try{
		if(!(req.body.b_user_id && req.body.content && req.body.shared)){
			res.status(403).send({
				message : "please input b_user_id and content and shared"
			});
		}else{
			let postboardQuery = 'INSERT INTO myjungnami.board(id, b_user_id, content, img_url, shared) VALUES (null, ?, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(postboardQuery, [req.body.b_user_id, req.body.content, req.files[0].location, req.body.shared]);

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