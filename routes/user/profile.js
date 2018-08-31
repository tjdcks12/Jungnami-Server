/*  내 프로필  */
/*  /user/profile  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const upload = require('../../module/multer_user_img.js');


/*  내 프로필 정보 보기  */
/*  /user/profile  */
router.get('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let u_id = chkToken.id;

    let myprofileSql =
    `
    SELECT nickname, img_url
    FROM user
    WHERE id = ?
    `
    let myprofileQuery = await db.queryParamCnt_Arr(myprofileSql,[u_id]);

    res.status(200).send({
        message : "Success",
        data : myprofileQuery
      });

  } catch(error) {
    return next("500");
  }

});


/*  내 프로필 수정 완료  */
/*  /user/profile  */
router.post('/', upload.array('img_url'), async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let u_id = chkToken.id;

    // 닉네임 인코딩
    let nickname = req.body.nickname;
    let img_url = req.files[0].location;

    let updateSql =
    `
    UPDATE user
    SET nickname = ?, img_url = ?
    WHERE id = ?
    `
    let updateQuery = await db.queryParamCnt_Arr(updateSql,[nickname, img_url, u_id]);
    if(!updateQuery){
      return next("500");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    return next("500");
  }

});



module.exports = router;
