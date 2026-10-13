const express = require('express');
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser =require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonna muutujate lugemiseks
require('dotenv').config();

const dateET = require('./src/dateTimeET');

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

//käivitan funktsiooni express() ja annan nimeks app
const app = express();
//määrame renderdusmootori: EJS
app.set('view engine', 'ejs');
//määrame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//määrame vormide sisu parsimise
app.use(bodyparser.urlencoded({extended: false}));

//marsruudid
app.get('/', (req, res)=>{
	const dayNow = dateET.weekday();
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	//res.send('Express.js veeb läkski käima!');
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

app.get('/vanasonad', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(';')
		res.render('vanasonad', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
		//res.render('vanasonad', {wisdom: folkWisdom[0]});
	}
	catch (err) {
		console.log(err);
		res.render('vanasonad', {wisdom: 'Kahjuks ei leidnud ühtegi vanasõna!'});
	}
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

app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/inimesed', async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerime SQL päringu
		let sqlReq = 'SELECT * FROM person';
		const [sqlRes] = await conn.execute(sqlReq);
		//console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
});

app.get('/eestifilm/inimesed_lisa', (req, res)=>{
	res.render('eestifilminimesed_lisa', {
		notice: 'Ootan sisestust',	
		firstNameInput: null,
		lastNameInput: null,
		bornInput: null,
		deceasedInput: null
		});
	});

app.post('/eestifilm/inimesed_lisa', async (req, res)=>{
	const firstNameInput = req.body.firstNameInput;
	const lastNameInput = req.body.lastNameInput;
	const bornInput = req.body.bornInput;
	const deceasedInput = req.body.deceasedInput;
	const timeNow = new Date();
	const bornDate = new Date(bornInput);
	if (!firstNameInput || !lastNameInput || !bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow) {
	//console.log(req.body);
	//kontrollime andmeid
	//sisestatud sünnikuupäev(text) teisendada kuupäevaks
	/* const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow){
		console.log("Andmed pole korrektsed!"); */
		return res.render('eestifilminimesed_lisa', {notice: 'Kontrolli oma sisestatud andmeid!',
		firstNameInput: firstNameInput || null,
		lastNameInput: lastNameInput || null,
		bornInput: bornInput || null,
		deceasedInput: deceasedInput || null
		});
	}
	let deceasedDate = null;
	if(deceasedInput != '') {
		deceasedDate = new Date(deceasedInput);
	if (isNaN(deceasedDate.getTime()) || deceasedDate > timeNow || deceasedDate < bornDate) {
		
	return res.render('eestifilminimesed_lisa', {
		notice: 'Surmakuupäev on vigane!',
		firstNameInput: firstNameInput || null,
		lastNameInput: lastNameInput || null,
		bornInput: bornInput || null,
		deceasedInput: deceasedInput || null
		})
	}
	deceasedDate = deceased;
}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput, 
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		
		res.render('eestifilminimesed_lisa', {
			notice: req.body.firstNameInput + ' ' + req.body.lastNameInput + ' andmebaasi lisatud!',
			firstNameInput: null,
			lastNameInput: null,
			bornInput: null,
			deceasedInput: null
			});
	}
	catch(err) {
		console.log('Viga andmebaasiga suhtelmisel: ' + err);
		res.render('eestifilminimesed_lisa', {notice: 'Tekkis viga, midagi ei salvestanud!',
		firstNameInput: firstNameInput || null,
		lastNameInput: lastNameInput || null,
		bornInput: bornInput || null,
		deceasedInput: deceasedInput || null
		});
	}
	finally {
			if(conn){
			await conn.end();
		}
	}
	
});

app.get('/eestifilm/film_lisa', (req, res) => {
	res.render('film_lisa', {
		notice: 'Ootan sisestust',
		movietitleInput:null,
		yearInput: null,
		durationInput: null,
		descriptionInput: null
	});
});

app.post('/eestifilm/film_lisa', async (req, res)=> {
	const movietitleInput = req.body.movietitleInput;
	const yearInput = req.body.yearInput;
	const durationInput = req.body.durationInput;
	const descriptionInput = req.body.descriptionInput
	
	    if (!movietitleInput || !yearInput ||
        !Number.isInteger(Number(yearInput)) ||
        Number(yearInput) < 1 ||
        Number(yearInput) > new Date().getFullYear() ||
        !durationInput ||
        !Number.isInteger(Number(durationInput)) ||
        Number(durationInput) < 1){

        return res.render('film_lisa', {
            notice: 'Kontrolli kõiki sisestatud andmeid!',
            movietitleInput: movietitleInput || null,
            yearInput: yearInput || null,
            durationInput: durationInput || null,
            descriptionInput: descriptionInput || null
        });
    }
	
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		
		let sqlReq = 'INSERT INTO movie (movie_title, release_year, duration_minutes, description) VALUES (?, ?, ?, ?)'
		await conn.execute(sqlReq,[
		req.body.movietitleInput,
		Number(yearInput),
		Number(durationInput),
		req.body.descriptionInput || ''
		]);
	res.render('film_lisa', {
		notice: 'Film on edukalt lisatud!',
		movietitleInput: null,
		yearInput: null,
		durationInput: null,
		descriptionInput: null
		});
	}
	catch (err) {
		console.log(err);
		res.render('film_lisa', {
			notice: 'Filmi lisamine ebaõnnestus!',
			movietitleInput: movietitleInput || null,
			yearInput: yearInput || null,
			durationInput: durationInput || null,
			descriptionInput: descriptionInput || null
		});
	}
	finally {
		if (conn) await conn.end();
		}
	});
app.get('/eestifilm/amet_lisa', (req, res)=> {
	res.render('amet_lisa', {
		notice: 'Ootan sisestust!',
		titleInput: null,
		descriptionInput: null
	});
});

app.post('/eestifilm/amet_lisa', async (req, res) => {
	const titleInput = req.body.titleInput;
	const descriptionInput = req.body.descriptionInput;
	
	 if (!titleInput|| !titleInput.trim()) {
        return res.render('amet_lisa', {
            notice: 'Sisesta ameti nimetus!',
            titleInput: titleInput || null,
			descriptionInput: descriptionInput || null
        });
}

let conn;
try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		await conn.execute(
		'INSERT INTO profession (title, description) VALUES (?, ?)', [titleInput, descriptionInput]
		);
		res.render('amet_lisa', {
			notice: 'Amet on edukalt lisatud!',
			titleInput: null,
			descriptionInput: null
		});
} catch(err) {
	console.log(err);
	res.render('amet_lisa', {
		notice: 'Ameti lisamine ebaõnnestus!',
		titleInput: titleInput || null,
		descriptionInput: descriptionInput || null
	});
}
	finally {
		if (conn) await conn.end();
	}
})
app.listen(5210);