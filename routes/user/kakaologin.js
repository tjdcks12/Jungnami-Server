const express = require('express');
const router = express.Router();
const async = require('async');
const bodyParser = require('body-parser');
const http = require('http');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

const request = require('request-promise');

router.post('/', async(req, res, next) => {
  console.log("===insert_userinfo.js ::: router('/')===");
  let accessToken = req.body.accessToken;

  let option = {
    method : 'GET',
    uri: 'https://kapi.kakao.com/v2/user/me',
    json : true,
    headers : {
      'Authorization': "Bearer " +  accessToken
    }
  }

  try {
    let cacaoResult = await request(option);

    let result = {};
    result.nickname = cacaoResult.properties.nickname;
    result.thumbnail_image = cacaoResult.properties.thumbnail_image;

    var nickname = cacaoResult.properties.nickname;
    var img_url = cacaoResult.properties.thumbnail_image;

    //console.log(cacaoResult.kakao_account.has_email + " : " + cacaoResult.kakao_account.email);
    var id = cacaoResult.id;
    var token;

    var chkToken;
    if(req.headers.authorization != undefined){
      chkToken = jwt.verify(req.headers.authorization);
    }

    // console.log()
    // console.log(chkToken);
    // console.log(jwt.verify(chkToken));

    let checkEmailQuery =
    `
    select * from user
    where id = ?
    `;

    let insertQuery =
    `
    INSERT INTO user (id, nickname, img_url)
    VALUES (?, ?, ?);
    `;

    if(chkToken != undefined){ // 토큰이 이미 있는 경우 (로그인 되어있는 경우)
      console.log("토큰이 있습니다");
      if(chkToken.id == id){
        console.log("성공적으로 로그인 되었습니다");
        res.status(200).send({
          result : {
            message : "success",
            token : req.headers.authorization,
            user : result
          }
        });
      } else { // 토큰이 만료된 경우 재발급
        console.log("기간이 만료되었습니다. 재발급 합니다");
        token = jwt.sign(id);
        res.status(200).send({
          "result" : {
            message : "your token ended and reissue new token",
            token : token ,
            user : result
          }
        })
      }
    } else{ // 토큰이 없는 경우
      let checkEmail = await db.queryParamCnt_Arr(checkEmailQuery,[id]);

      if(checkEmail.length != 0){ // 기기를 변경했을 경우
        console.log("다른기기에서 접속했습니다");
        res.status(200).send({
          "result" : {
            message : "new device login",
            token : jwt.sign(id),
            user : result
          }
        });
      } else{ // 다른 기기이고 회원이 아닐때
        console.log("비회원입니다.")

        let insertResult = await db.queryParamCnt_Arr(insertQuery,[id, nickname ,img_url]);

        token = jwt.sign(id);

        res.status(200).send({
          "result" : {
            message : "sign up success",
            token : token,
            user : result
          }
        })
      }
    }
  }
  catch(err) {
    console.log("Cacao Error => " + err);
    next(err);
  }
  finally {
    console.log('finally');
  }

});

module.exports = router;