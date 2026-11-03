const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp')
const dateET = require('../src/dateTimeET');
//@desc page for uploading photos to gallery
//@route GET /galleryPhotoUpload
//@access public

const galleryPhotoUpload = (req, res) => {
	res.render('galleryphotoupload');
};


//@desc page for uploading photos to gallery
//@route POST /galleryPhotoUpload
//@access public

const galleryPhotoUploadPost = async (req, res) => {
	//console.log(req.file);
	//console.log(req.body);
	let conn;
	try {
		//genereerida oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		await fs.rename(req.file.path, process.env.UPLOAD_ORIGINAL_PATH + fileName);
		await sharp(process.env.UPLOAD_ORIGINAL_PATH + fileName).resize(800, 600).composite([{input: './public/Pic/vp_logo_small.png', gravity: 'southeast'}]).jpeg({ quality: 90 }).toFile(process.env.UPLOAD_RESIZED_PATH + fileName);
		await sharp(process.env.UPLOAD_ORIGINAL_PATH + fileName).resize(100, 100).jpeg({ quality: 90 }).toFile(process.env.UPLOAD_THUMBNAIL_PATH + fileName);
		let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?, ?, ?, ?, ?)';
		const userId = 1; //see on ajutine, kuni teeme kasutajakontod ja sisselogimise
		let conn;
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
		const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log('Salvestati foto kirje id: ' + result.insertId);
		res.render('galleryphotoupload');
	} catch (err) {
		console.log('Viga: ' + err);
		res.render('galleryphotoupload');
	} finally {
        if (conn) {
			await conn.end();
		}
	}
};

const showHome = async (req, res) => {
  let conn;
  try {
	const dayNow = dateET.weekday();
    const dateNow = dateET.date(0);
    const timeNow = dateET.time();
	
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    const sql = "SELECT filename, alttext FROM galleryphotos WHERE id = (SELECT MAX(id) FROM galleryphotos WHERE privacy = ? AND deleted IS NULL)";
    const [rows] = await conn.execute(sql, [3]);
    await conn.end();

    let latestPhoto = rows && rows.length > 0 ? rows[0] : null;
    if (latestPhoto && (!latestPhoto.alttext || latestPhoto.alttext.trim() === "")) {
      latestPhoto.alttext = "Uusim avalik foto";
    }

    // Edastame EJS mallile KÕIK vajalikud muutujad korraga
    res.render('index', { latestPhoto, dayNow, dateNow, timeNow });
  } catch (err) {
    console.error("Viga avalehe andmete laadimisel:", err);
    if (conn) {
      try { await conn.end(); } catch (e) {}
    }
    res.render('index', { latestPhoto: null, dayNow: '', dateNow: '', timeNow: '' });
  }
};

const gallery = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    const sql = "SELECT filename, alttext FROM galleryphotos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
    const [rows] = await conn.execute(sql, [3]);
    await conn.end();

    res.render('gallery', { photos: rows });
  } catch (err) {
    console.error("Viga galerii laadimisel:", err);
    if (conn) {
      try { await conn.end(); } catch (e) {}
    }
    res.render('gallery', { photos: [] });
  }
};
module.exports = {
	showHome,
	gallery,
	galleryPhotoUpload,
	galleryPhotoUploadPost
}