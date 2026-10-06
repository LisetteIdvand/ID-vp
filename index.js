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

app.get('/eestifilmid', (req, res)=>{
	res.render('eestifilmid');
});

app.get('/eestifilmid/inimesed', async (req, res)=>{
	let connection;
	try {
		connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerime SQL päringu
		let sqlReq = 'SELECT * FROM person';
		const [sqlRes] = await connection.execute(sqlReq);
		//console.log(sqlRes);
		res.render('eestifilmidinimesed', {personList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('eestifilmidinimesed', {personList: []});
	}
	finally {
		if(connection){
			await connection.end();
		}
	}
	
});

app.get('/eestifilmid/inimesed_lisa', (req, res)=>{
	res.render('eestifilmidinimesed_lisa', {notice: 'Ootan sisestust'});
});

app.post('/eestifilmid/inimesed_lisa', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmeid
	//sisestatud sünnikuupäev(text) teisendada kuupäevaks
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	if(!req.body.firstaNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow){
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilmidinimesed_lisa', {notice: 'Andmed pole korrektsed'});
	}
	let deceasedDate = null;
	if(req.body.deceasedInput != ''){
		deceasedDate = req.body.deceasedInput;
	}
	let connection;
	try {
		connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await connection.execute(sqlReq, [
			req.body.firstaNameInput, 
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilmidinimesed_lisa', {notice: req.body.firstNameInput + '' + req.body.lastNameInput + ' andmebaasi lisatud!'});
	}
	catch(err) {
		console.log('Viga andmebaasiga suhtelmisel: ' + err);
		res.render('eestifilmidinimesed_lisa', {notice: 'Tekkis viga, midagi ei salvestanud!'});
	}
	finally {
		if(connection){
			await connection.end();
		}
	}
});

app.listen(5210);