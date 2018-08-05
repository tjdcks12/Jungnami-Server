// 게시판관련 썸네일, 카드뉴스 이미지 등록 양식
// 종찬

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
            cb(null, "user_img/" + file.originalname);
            // test가 폴더이름 ( ex) profile )
        }
    })
});

// 'image'가 클라이언트랑 입맞춰야하는 이미지 파라미터
router.post('/', upload.array('image'), async(req, res) => {
  let testsql = "update user set img_url = ? where id = ?;";
  let queryResult = await db.queryParamCnt_Arr(testsql,[req.files[0].location, req.body.userid]);


	res.status(201).send({
		message : "Successfully Store files"
	});
});


module.exports = router;
