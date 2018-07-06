/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const upload = require('../../module/multer_user_img.js');


/*  내 프로필 수정하는 뷰  */
/*  /user/editprofile  */
router.get('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }

    let u_id = chkToken.id;

    let myprofileSql = "SELECT nickname, img_url FROM user WHERE id = ?;"
    let myprofileQuery = await db.queryParamCnt_Arr(myprofileSql,[u_id]);

    if(myprofileQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");
    }

    res.status(200).send({
        message : "Select Data Success",
        data : myprofileQuery
      });

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});



/*  내 프로필 수정 완료하고 나서  */
/*  /user/editprofile  */
router.post('/', upload.array('img_url'), async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }

    let u_id = chkToken.id;
    let nickname = req.body.nickname;
    let img_url = req.files[0].location;

    let updateSql = "UPDATE user SET nickname = ?, img_url = ? WHERE id = ?;"
    let updateQuery = await db.queryParamCnt_Arr(updateSql,[nickname, img_url, u_id]);

    res.status(201).send({
      message : "Update Data Success"
    });
    
  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});



module.exports = router;
