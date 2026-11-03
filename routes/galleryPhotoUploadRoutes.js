const express = require('express');
const multer = require('multer');
const router = express.Router();

//seadistame multer vahevara failide üleslaadimiseks
//määran üleslaadimise kataloogi
const upload = multer({ dest: process.env.UPLOAD_ORIGINAL_PATH });

//kasutatavad kontrollerid
const {
	showHome,
	gallery,
	galleryPhotoUpload,
	galleryPhotoUploadPost} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(showHome);

router.route('/gallery').get(gallery);

router.route('/upload').get(galleryPhotoUpload);

//post osa suunatakse läbi vahevara - upload
router.route('/upload').post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;