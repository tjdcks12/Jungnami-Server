//커뮤니티 글 작성 완료 버튼 눌렀을 때 작성 완료 - OK
var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const jwt = require('../../module/jwt.js');
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

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      res.status(401).send({
        message : "Access Denied"
      });

      return;
    }

    var userid = chkToken.id;

    console.log(req.body);

    let postboardQuery = 'INSERT INTO myjungnami.board (b_user_id, content, img_url, shared) VALUES ( ?, ?, ?, ?)';
    let data = await db.queryParamCnt_Arr(postboardQuery, [userid, req.body.content, req.body.img_url, req.body.shared]);
    if(data == undefined){
      res.status(204).send({
        "message" : "fail insert"
      });

      return;
    }
    
    res.status(201).send({
      "message" : "Successfully insert posting",
    });
  }catch(err){
    console.log(err);
    res.status(500).send({
      "message" : "Server error"
    });
  }
})

module.exports = router;
