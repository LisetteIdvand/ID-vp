const mysql = require('mysql2/promise');

//@desc home page for Estionian Film section
//@route GET /eestifilm
//@access public


//app.get('/eestifilm', (req, res)=>{
const eestifilm = (req, res) =>{
	res.render('eestifilm');
};
//@desc home page for people involved in Estonian Film industry
//@route GET /eestifilm/inimesed
//@access public

//app.get('/eestifilm/inimesed', async (req, res)=>{
	const inimesed = async (req, res) => {
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
};

//@desc home page for adding people involved in Estonian Film industry
//@route GET /eestifilm/inimesed_lisa
//@access public
//app.get('/eestifilm/inimesed_lisa', (req, res)=>{
const inimesedAdd = (req, res) => {
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust', 
	firstNameInput: null,
	lastNameInput: null,
	bornInput: null,
	deceasedInput: null
	});
};

//@desc home page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed_lisa
//@access public

//app.post('/eestifilm/inimesed_lisa', async (req, res)=>{
const inimesedAddPost = async (req, res) => {
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
};

//@desc home page for adding professions involved in filmmaking
//@route GET /eestifilm/film_lisa
//@access public

const ametid = async (req, res) => {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq = 'SELECT * FROM profession ORDER BY id';
        const [sqlRes] = await conn.execute(sqlReq);
        res.render('ametid', { professionList: sqlRes });

    } catch (err) {
        console.log('Viga andmebaasist lugemisel:' + err);
        res.render('ametid', { professionList: [] });
    } finally {
        if (conn) await conn.end();
    }
};


//@desc home page for adding professions involved in filmmaking
//@route GET /eestifilm/amet_lisa
//@access public

const ametidAdd = (req, res) => {	
	res.render('ametid_lisa', {
		notice: 'Ootan sisestust!',
		title: null,
		description: null
	});
};

//@desc home page for adding professions involved in filmmaking
//@route POST /eestifilm/amet_lisa
//@access public

const ametidAddPost = async (req, res) => {
	const { title, description} = req.body;
	const showForm = (notice, clear = false) => {
		res.render('ametid_lisa', {
			notice: notice,
			title: clear ? '': title,
			description: clear ? '': description
		});
	};
	if (
		!title?.trim() || !description?.trim()
	) {
		return showForm('Ootan sisestust!');
	}
	let conn;
	
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'INSERT INTO profession (title, description) VALUES (?, ?)';
		await conn.execute(sqlReq, [
		title.trim(),
		description.trim()
		]);
		showForm ('Andmed on edukalt salvestatud!', true);
	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		showForm('Tekkis viga, andmeid ei salvestatud!');
	} finally {
		if (conn) {
			await conn.end();
		}
	}
};

//@desc page for list Estonian Films
//@route GET /eestifilm/film
//@access public

const filmid = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM movie ORDER BY movie_title';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('filmid', {movieList: sqlRes});
	}
	catch(err){
		console.log('viga andmebaasist lugemisel: ' + err);
		res.render('filmid', {movieList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding Estonian Films
//@route GET /eestifilm/filmid_add
//@access public

const filmidAdd = (req, res) => {
    res.render('filmid_lisa', {
        notice: 'ootan sisestust',
        titleInput: '',
        yearInput: '',
        durationInput: '',
        descriptionInput: ''
    });
};


//@desc page for adding Estonian Films
//@route POST /eestifilm/filmid_lisa
//@access public

const filmidAddPost = async (req, res) => {
	const now = new Date();
	const year = Number(req.body.yearInput);
	const duration = Number(req.body.durationInput);

	if(!req.body.titleInput){
		return res.render('filmid_lisa', {
			notice: 'filmi pealkiri puudub',
			titleInput: req.body.titleInput,
			yearInput: req.body.yearInput,
			durationInput: req.body.durationInput,
			descriptionInput: req.body.descriptionInput
});

	}
	if(!Number.isInteger(year) || year < 1880 || year > now.getFullYear()){
		return res.render('filmid_lisa', {notice: 'valmimisaasta on vigane', movieTitle: req.body.titleInput, releaseYear: req.body.yearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	if(!Number.isInteger(duration) || duration <= 0){
		return res.render('filmid_lisa', {notice: 'kestus on vigane', movieTitle: req.body.titleInput, releaseYear: req.body.yearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	let conn;
try {
    conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    const sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?, ?, ?, ?)';
    await conn.execute(sqlReq, [
        req.body.titleInput,
        Number(req.body.yearInput),
        Number(req.body.durationInput),
        req.body.descriptionInput || ''
    ]);

    res.render('filmid_lisa', {
        notice: 'Film edukalt lisatud!',
        titleInput: '',
        yearInput: '',
        durationInput: '',
        descriptionInput: ''
    });

} catch (err) {
    console.log('viga andmebaasiga suhtlemisel: ' + err);
    res.render('filmid_lisa', {
        notice: 'andmebaasi suhtlus nurjus',
        titleInput: req.body.titleInput,
        yearInput: req.body.yearInput,
        durationInput: req.body.durationInput,
        descriptionInput: req.body.descriptionInput
    });
} finally {
    if (conn) await conn.end();
}};

module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	ametid,
	ametidAdd,
	ametidAddPost,
	filmid,
	filmidAdd,
	filmidAddPost
}