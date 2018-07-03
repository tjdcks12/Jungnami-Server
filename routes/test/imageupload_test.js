const express = require('express');
const router = express.Router();

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
            cb(null, "test/" + file.originalname);
            // test가 폴더이름 ( ex) profile )
        }
    })
});

// 'image'가 클라이언트랑 입맞춰야하는 이미지 파라미터
router.post('/', upload.array('image'), async(req, res) => {
	console.log(req.files);

  let testsql = "INSERT INTO board (board_user_id, content, img_url, board_shared) VALUES (?,?,?,?)";
  let userQuery = await db.queryParamCnt_Arr(testsql,["1","이종찬",req.files[0].location,0]);

	res.status(201).send({
		message : "Successfully Store files"
	});
});

module.exports = router;
