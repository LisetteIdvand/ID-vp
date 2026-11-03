const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	filmid,
	filmidAdd,
	filmidAddPost,
	ametid,
	ametidAdd,
	ametidAddPost} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_lisa').get(inimesedAdd);

router.route('/inimesed_lisa').post(inimesedAddPost);

router.route('/filmid').get(filmid);

router.route('/filmid_lisa').get(filmidAdd);

router.route('/filmid_lisa').post(filmidAddPost);

router.route('/ametid').get(ametid);

router.route('/ametid_lisa').get(ametidAdd);

router.route('/ametid_lisa').post(ametidAddPost);

module.exports = router;