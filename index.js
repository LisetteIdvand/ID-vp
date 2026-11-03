const express = require('express');
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser =require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonna muutujate lugemiseks
require('dotenv').config();

//const dateET = require('./src/dateTimeET');

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

//käivitan funktsiooni express() ja annan nimeks app
const app = express();
//määrame renderdusmootori: EJS
app.set('view engine', 'ejs');
//määrame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//määrame vormide sisu parsimise, kui false siis ainult tekst
app.use(bodyparser.urlencoded({extended: true}));

 //marsruudid
/* app.get('/', (req, res)=>{
	const dayNow = dateET.weekday();
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
}); */
	
app.get('/vanasonad', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(';')
		res.render('vanasonad', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
		//res.render('vanasonad', {wisdom: folkWisdom[0]});
	} catch (err) {
		console.log(err);
		res.render('vanasonad', {wisdom: 'Kahjuks ei leidnud ühtegi vanasõna!'});
	};
});

app.get('/opingud', async (req, res)=>{
	res.render('opingud');
});

app.get('/viimane', async (req, res)=>{
	try {
		const data = await fs.readFile(regtextRef, "utf8");
		let list = data.split(";");
		let lastEntry = list[list.length - 2];
		let parts = lastEntry.split(",");
		let name = parts[0];
		let date = parts[1];
		let time = parts[2];
		res.send(`Viimati registreeriti külastus ${date}, kell ${time}, kui seda tegi ${name}.`);
	}
	catch(err){
		console.log(err);
		res.send('Külastuste faili ei õnnestu lugeda:(');
	}
});
app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
})

app.post('/regvisit', async (req, res)=>{
	try {
		const name = req.body.inputName;
		const dayNow = dateET.weekday();
		const dateNow = dateET.date();
		const timeNow = dateET.time();
		const entry = `${name},${dateNow},${timeNow};`;
		await fs.appendFile(regtextRef, entry);
		res.render('regvisit');
		console.log("DATE:", dateET.date());
		console.log("TIME:", dateET.time());

	}
	catch(err) {
		console.log(err);
		res.render('regvisit');
	}
}); 

//Eesti filmi marsruudid
const eestiFilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestiFilmRouter);

//Seoste marsruudid
const relationRouter = require('./routes/relationRoutes');
app.use('/eestifilm', relationRouter);

//galleriipiltide üleslaadimine

const galleryPhotosUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/', galleryPhotosUploadRouter);

app.listen(5210);