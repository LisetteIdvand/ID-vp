const mysql = require('mysql2/promise');
const validator = require('validator');
const argon = require('argon2');

//@desc page for creating user accounts
//@route GET /signup
//@access public

const signupPage = (req, res) => {
	res.render('signup', {notice: 'Ootan andmeid'});
};

//@desc page for creating user accounts
//@route POST /signup
//@access public

const signupPagePost = async (req, res) => {
	let conn;
	//andmete puhastamine ja valideerimine
	const firstName = validator.escape(req.body.firstNameInput.trim());
	const lastName = validator.escape(req.body.lastNameInput.trim());
	const birthDate = req.body.birthDateInput;
	const gender = req.body.genderInput;
	const email = req.body.emailInput.trim();
	const password = req.body.passwordInput;
	const confirmPassword = req.body.confirmPasswordInput;

	//kontrollima kas kõik oluline on olemas
	if (!firstName || !lastName || !birthDate || !gender || !email || !password || !confirmPassword) {
		notice = 'Andmeid on puudu või miski pole korrektne!';
		return res.render('signup', {notice: notice});
	}
	
	//kas email on korrektne
	if(!validator.isEmail(email)){
		notice = 'Emaili aadress pole korrektne!';
		return res.render('signup', {notice: notice});
	}
		
	//kas parool on piisavalt tugev
	const passwordOptions = {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0};
	if(!validator.isStrongPassword(password, passwordOptions)){
		notice = 'Parool on liiga nõrk. Vaja on suur- ja väiketähti, numbreid ning kokku minimaalselt 8 märki!';
		return res.render('signup', {notice: notice});
	}
	
	//kas paroolid ühtivad
	if(password !== confirmPassword) {
		notice = 'Sisestatud paroolid ei ole ühesugused!';
		return res.render('signup', {notice: notice});
	}
	
	//kas sünnikuupäev on korrektne
	if(!validator.isDate(birthDate) || validator.isAfter(birthDate)) {
		notice = 'Sisestatud sünnikuupäev ei ole korrektne!';
		return res.render('signup', {notice: notice});
	}
	
	try {
		//kontrollin kas selline kasutaja on juba olemas
		let sqlReq = 'SELECT id FROM users WHERE email = ?';
		conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
		const [users] = await conn.execute(sqlReq, [email]);
		if (users.length > 0) {
			notice = 'Selline kasutaja on juba olemas!';
			return res.render('signup', {notice: notice});
		}
		
		//krüpteerime paroolid
		const pwdHash = await argon.hash(password);
		
		sqlReq = 'INSERT INTO users (firstname, lastname, birthdate, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)';
		const [result] = await conn.execute(sqlReq, [
			firstName,
			lastName,
			birthDate,
			gender,
			email,
			pwdHash
		]);
		
		res.render('signup', {notice: 'Kasutajakonto loodud!'});
	} 
	catch (err) {
		console.log('Viga: ' + err);
		res.render('signup', {notice: 'Konto loomine ebaõnnestus!'});
	} 
	finally {
        if (conn) {
			await conn.end();
		}
	}
};


module.exports = {
	signupPage,
	signupPagePost
}