// delete routes

const express = require('express');
const router = express.Router();

// board 게시글 삭제
router.use('/board', require('./board'));

// contents 게시글 삭제
router.use('/contents', require('./contents'));

// board 좋아요 취소
router.use('/boardlike', require('./boardlike'));

// contents 좋아요 취소
router.use('/contentslike', require('./contentslike'));

// board 댓글 좋아요 취소
router.use('/boardcommentlike', require('./boardcommentlike'));

// contents 댓글 좋아요 취소
router.use('/contentscommentlike', require('./contentscommentlike'));

// board 대댓글 좋아요 취소
router.use('/boardrecommentlike', require('./boardrecommentlike'));

// contents 대댓글 좋아요 취소
router.use('/contentsrecommentlike', require('./contentsrecommentlike'));


// board 댓글 삭제
router.use('/boardcomment', require('./boardcomment'));

// contents 댓글 삭제
router.use('/contentscomment', require('./contentscomment'))

// board 대댓글 삭제
router.use('/boardrecomment', require('./boardrecomment'))

// contents 대댓글 삭제
router.use('/contentsrecomment', require('./contentsrecomment'))

// scrap 삭제
router.use('/scrap', require('./scrap'));



module.exports = router;
