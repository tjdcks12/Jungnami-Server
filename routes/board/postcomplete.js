//커뮤니티 글 작성 완료 버튼 눌렀을 때 작성 완료 - OK
var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const upload = require('../../module/multer_board_img.js');

router.post('/', upload.array('image'), async(req, res) => {
  try{

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    var userid = chkToken.id;
    let content, image;
    let shared = req.body.shared;

    if (req.body.content){
      content = req.body.content;
    } else {
      content = ""
    }

    if (req.files[0]){
      image = req.files[0].location;
    } else {
      image = "0"
    }

    let postboardQuery =
    `
    INSERT INTO
    myjungnami.board (b_user_id, content, img_url, shared)
    VALUES (?, ?, ?, ?)
    `;
    let data = await db.queryParamCnt_Arr(postboardQuery, [userid, content, image, shared]);
    if(!data){
      return next("500");
    }

    res.status(201).send({
      "message" : "Success",
    });
  }catch(err){
    console.log(err);
    return next("500");
  }
})

module.exports = router;
