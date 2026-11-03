const mysql = require('mysql2/promise');

//@desc page for relations between different aspects in Estionian Film Industry
//@route GET /eestifilm
//@access public

/* const e = (req, res) =>{
	res.render('eestifilm');
}; */
	
//@desc home page for relations between different aspects in Estionian Film Industry
//@route GET /eestifilm/relation
//@access public

	const relationHome = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'SELECT pim.id, p.first_name, p.last_name, m.movie_title, pr.title AS profession, pim.character_name FROM person_in_movie pim JOIN person p ON pim.person_id = p.id JOIN movie m ON pim.movie_id = m.id JOIN profession pr ON pim.profession_id = pr.id ORDER BY m.movie_title, p.last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('relationHome');
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};
	
/* 	const relation = async (req, res) => {
    let conn;
    try {
        conn = await conn();
        const [relation] = await conn.execute(`
            SELECT pim.id, p.first_name, p.last_name, m.movie_title, pr.title AS profession, pim.character_name
            FROM person_in_movie pim
            JOIN person p ON pim.person_id = p.id
            JOIN movie m ON pim.movie_id = m.id
            JOIN profession pr ON pim.profession_id = pr.id
            ORDER BY m.movie_title, p.last_name
        `);
        res.render('relation', { relation });
    } catch (err) {
        console.error("Viga seoste laadimisel:", err);
        res.render('relation', { relation: [] });
    } finally {
        if (conn) await conn.end();
		}
	};
}; */
//@desc home page for adding relations between different aspects in Estionian Film Industry
//@route GET /eestifilm/relation_lisa
//@access public

	const relationAdd = async (req, res) => {
		let conn;
		try {
			conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
			const [people] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name');
			const [movies] = await conn.execute('SELECT id, movie_title FROM movie ORDER BY movie_title');
			const [professions] = await conn.execute('SELECT id, title FROM profession ORDER BY title');

			res.render('relation_lisa', { people, movies, professions, notice: null });
		} catch (err) {
			console.error("Viga lisamisvormi andmete laadimisel:", err);
			res.render('relation_lisa', { people: [], movies: [], professions: [], notice: 'Viga andmete laadimisel' });
		} finally {
			if (conn) await conn.end();
		}
	};
	
//@desc home page for adding relations between different aspects in Estionian Film Industry
//@route POST /eestifilm/relation_lisa
//@access public

	const relationAddPost = async (req, res) => {
		let { person_id, movie_id, profession_id, character_name } = req.body;
		if (!character_name || character_name.trim() === '') {
			character_name = null;
		}

		let conn;
		try {
			conn = await conn();
			let existing;
			if (character_name === null) {
				[existing] = await conn.execute(
					`SELECT * FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name IS NULL`,
					[person_id, movie_id, profession_id]
				);
			} else {
				[existing] = await conn.execute(
					`SELECT * FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name = ?`,
					[person_id, movie_id, profession_id, character_name]
				);
			}

			if (existing.length > 0) {
				const [people] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name');
				const [movies] = await conn.execute('SELECT id, movie_title FROM movie ORDER BY movie_title');
				const [professions] = await conn.execute('SELECT id, title FROM profession ORDER BY title');

				return res.render('relation_lisa', {
					notice: 'Selline seos on juba andmebaasis olemas!',
					people,
					movies,
					professions
				});
			}
			
			await conn.execute(
				`INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?, ?, ?, ?)`,
				[person_id, movie_id, profession_id, character_name]
			);

			const [people] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name');
			const [movies] = await conn.execute('SELECT id, movie_title FROM movie ORDER BY movie_title');
			const [professions] = await conn.execute('SELECT id, title FROM profession ORDER BY title');

			res.render('relation_lisa', {
				notice: 'Seos edukalt lisatud!',
				people,
				movies,
				professions
			});

		} catch (err) {
			console.error("Viga seose salvestamisel:", err);
			res.render('relation_lisa', { notice: 'Viga salvestamisel', people: [], movies: [], professions: [] });
		} finally {
			if (conn) await conn.end();
		}
	};

module.exports = {
    relationHome,
    relationAdd,
    relationAddPost};