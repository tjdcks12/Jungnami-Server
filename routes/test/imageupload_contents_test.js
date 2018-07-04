// 컨텐츠관련 썸네일, 카드뉴스 이미지 등록 양식
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
            cb(null, file.fieldname + "/" + file.originalname);
            // fieldname을 이용
        }
    })
});


// 콘텐츠에서 thumnail, cardnews 따로받을 때 이거 사용
router.post('/', upload.fields([{name : 'thumbnail', maxCount : 1}, {name : 'cardnews', maxCount : 20}]), async(req, res) => {
  // content table에 thumbnail 저장
  var testsql = "INSERT INTO contents (title, thumbnail_url, category) VALUES (?,?,?)";
  var queryResult = await db.queryParamCnt_Arr(testsql,["타이틀", req.files.thumbnail[0].location, "카테고리"]);

  // content id가져오기
  testsql = "SELECT id FROM contents WHERE title = ? AND thumbnail_url = ?";
  queryResult = await db.queryParamCnt_Arr(testsql,["타이틀", req.files.thumbnail[0].location]);
  let contentsId = queryResult[0].id; // 가져온 contents id


  // contentImg table에 이미지 저장
  testsql = "INSERT INTO contentsImg (ci_contents_id, img_url) VALUES (?,?)";
  for(var i=0; i<req.files.cardnews.length; i++){
    queryResult = await db.queryParamCnt_Arr(testsql,[contentsId, req.files.cardnews[i].location]);
  }

  res.status(201).send({
    message : "Successfully Store files"
  });
});

module.exports = router;
