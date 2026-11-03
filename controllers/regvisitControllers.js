const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/txt/visits.txt');

// GET /regvisit 
const regvisitHome = (req, res) => {
    let lastVisit = null;

    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8').split(';').filter(r => r.trim() !== '');
        const last = raw[raw.length - 1]; // VIIMANE element
        if (last) {
            const [name, date, time] = last.split(',');
            lastVisit = { name, date, time };
        }
    }
    res.render('regvisit', { lastVisit });
};

// GET /regvisit/visit_lisa
const regvisitAdd = (req, res) => {
    res.render('regvisit_lisa', { notice: null });
};

// POST /regvisit/visit_lisa
const regvisitAddPost = (req, res) => {
    const { nameInput } = req.body;

    const now = new Date();
    const date = now.toLocaleDateString('et-EE');
    const time = now.toLocaleTimeString('et-EE');

    fs.appendFileSync(filePath, `${nameInput},${date},${time};`);

    res.render('regvisit_lisa', { notice: 'Külastus registreeritud!' });
};

module.exports = {
    regvisitHome,
    regvisitAdd,
    regvisitAddPost
};
