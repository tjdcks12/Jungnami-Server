//커뮤니티 글 작성 완료 버튼 눌렀을 때 작성 완료 - OK 
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

aws.config.loadFromPath('./config/aws_config.json');

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'myrubysbucket',
        acl: 'public-read',
        key: function(req, file, cb) {
            cb(null, "board/" + file.originalname);
        }
    })
});

router.post('/', upload.array('image'), async(req, res) => {
	try{
		if(!(req.body.user_id && req.body.content && req.body.shared)){
			res.status(403).send({
				message : "please input user id & content & shared"
			});
		}else{

			let postboardQuery = 'INSERT INTO myjungnami.board( b_user_id, content, img_url, shared) VALUES ( ?, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(postboardQuery, [req.body.user_id, req.body.content, req.body.img_url, req.body.shared]);

			//req.files[0].location

			res.status(201).send({
				"message" : "Successfully insert posting",
				//"data" : data
			});

			console.log(data);
		}
	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "Server error"
		});
	}
})

module.exports = router;