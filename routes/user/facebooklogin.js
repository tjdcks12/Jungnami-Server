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

  // facebook access token
  let accessToken = req.body.accessToken;
  //let accessToken = 'EAAOrNfcR65ABANc1JsTRhLRO1PAP0SHucq9zrPtZAmEwAXgGhdvB2dGhswrq9vkA6ePJw8da2mb7DZBi7n2bWMMCuEuWDbhZAW6WU2OEW8ZArJf78bGZCFocApmgvcPnUqPqWbJ9JP7uBketGU38ZCUTztduGUejZBivgOCD3cau8aInxDdpFAQeiF0v5TovQ9oDCqh1mWIEYbPrZA1uSOFNQ1bd7MRH458ZD';
  // push 알람 클라이언트 토큰
  let fcmToken = req.body.fcmToken;

  let option = {
    method : 'GET',
    uri: 'https://graph.facebook.com/me?fields=id,name,picture&access_token=' + accessToken,
    json : true
    // headers : {
    //   'Authorization': "Bearer " +  accessToken
    // }
  }

  // https://graph.facebook.com/{userid}/picture?type=large&width=720&height=720

  try {
    let facebookResult = await request(option);

    let result = {};
    result.nickname = facebookResult.name;
    result.thumbnail_image = facebookResult.picture.data.url;

    var id = facebookResult.id;
    var nickname = facebookResult.name;
    var img_url = "https://graph.facebook.com/" + id + "/picture?type=large&width=720&height=720";

    //console.log(cacaoResult.kakao_account.has_email + " : " + cacaoResult.kakao_account.email);

    var token;

    var chkToken;
    if(req.headers.authorization != undefined){
      chkToken = jwt.verify(req.headers.authorization);
    }

    // console.log()
    // console.log(chkToken);
    // console.log(jwt.verify(chkToken));

    let checkidQuery =
    `
    select * from user
    where id = ?
    `;

    let insertQuery =
    `
    INSERT INTO user (id, nickname, img_url)
    VALUES (?, ?, ?);
    `;
    let updateToken =
    `
    UPDATE user SET fcmToken = ? WHERE id = ?;
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
      let checkid = await db.queryParamCnt_Arr(checkidQuery,[id]);

      if(checkid.length != 0){ // 기기를 변경했을 경우
        // fcm token update
        let updatefcmToken = await db.queryParamCnt_Arr(updateToken, [fcmToken, id]);
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
    console.log("Facebook Error => " + err);
    next(err);
  }
  finally {
    console.log('finally');
  }

});

module.exports = router;


// test facebook accessToken
// EAAOrNfcR65ABAHZCceCrjflTQ8GhA9fwrBtgb5TCeYFXs6cZAeSkMFiZBkdq8JoITyWOUHARF2ZCwZBVW36ewmSwD2nJZASHEgi9SJXZAZAZAdbR4qdtpRR3hxjYZB9no69sIJS6ZAjUdxvhhAHV1AZC2xin5uDuzTZBhEBi9SMzfrZBJfMS4S5rT4kPgnxfCH9p48akCL61dvSEAnldcf0GZBZA9G5qOQhZBpLUW0FAZD
