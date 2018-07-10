/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents_img.js');


/*  관리자가 컨텐츠 글을 게시하는 페이지  */
/*  /contents/post  */
router.get('/', async(req, res, next) => {

  try {

    let legislatorSql = "SELECT id, name, l_party_name, position FROM legislator;"
    let legislatorQuery = await db.queryParamCnt_Arr(legislatorSql,[]);

    if(legislatorQuery.length == 0){

      res.status(300).send({
        message: "select legislator data error"
      });
      return;

    }

    res.status(200).send({
      message : "Select Data Success",
      data : legislatorQuery
    });


  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});



/*  컨텐츠 게시 완료  */
/*  /contents/post  */
router.post('/', upload.fields([{name : 'thumbnail', maxCount : 1}, {name : 'cardnews', maxCount : 20}]), async(req, res) => {
  try{
    let title = req.body.title;
    let subtitle = req.body.subtitle;
    let contents_type = req.body.contents_type;
    let category = req.body.category;
    let l_id; // array

    let thumbnail, cardnews, youtubelink;

    if (req.files.thumbnail){
      thumbnail = req.files.thumbnail[0].location;
    } else {
      thumbnail = null;
    }

    if(req.body.l_id == undefined) { // wrong input
      l_id = [];
    } else {
      l_id = req.body.l_id;
    }

    // content table에 thumbnail 저장
    var postSql = "INSERT INTO contents (title, subtitle, thumbnail_url, category, contents_type) VALUES (?, ?, ?, ?, ?);";
    var postResult = await db.queryParamCnt_Arr(postSql,[title, subtitle, thumbnail, category, contents_type]);

    if(postResult == undefined){
      res.status(204).send({
        "message" : "Insert contents thumbnail error"
      });

      return;
    }

    let c_id = postResult.insertId;

    console.log(postResult.insertId);


    // contentImg table에 cardnews 저장
    if (req.files.cardnews){

      cardnews = req.files.cardnews;

      let insertcardnewsSql = "INSERT INTO contentsImg (ci_contents_id, img_url) VALUES (?,?)";
      for(var i=0; i<cardnews.length; i++){
        let insertcardnewsQuery = await db.queryParamCnt_Arr(insertcardnewsSql,[c_id, cardnews[i].location]);

        if(insertcardnewsQuery == undefined){
          res.status(204).send({
            "message" : "Insert cardnews error"
          });

          return;
        }
      }

    }

    // content table에 youtubelink 삽입
    if (req.body.youtubelink){
      youtubelink = req.body.youtubelink;

      let insertyoutubelinkSql = "UPDATE contents SET youtubelink = ? WHERE id = ?;"
      let insertyoutubelinkQuery = await db.queryParamCnt_Arr(insertyoutubelinkSql,[youtubelink, c_id]);

      if (updatedata.affectedRows == 0){
        res.status(204).send({
          message : "Update youtubelink error"
        });
        return;
      }

    }

    console.log(l_id)
    // hash table에 c_id, l_id 저장
    for (var i=0; i<l_id.length; i++) {

      var hashSql = "INSERT INTO hash (h_contents_id, h_legislator_id) VALUES (?, ?);";
      var hashQuery = await db.queryParamCnt_Arr(hashSql, [c_id, l_id[i]]);

      console.log(hashQuery)

      if(hashQuery == undefined) {
        res.status(204).send({
          "message" : "Insert hash error"
        });

        return;
      }
    }

    res.status(201).send({
      message : "Successfully posting contents"
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
        message : "Internal Server Error"
      });
  }


});


module.exports = router;
