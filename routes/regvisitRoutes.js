const express = require('express');
const router = express.Router();
const { 
regvisitHome, 
regvisitAdd, 
regvisitAddPost } = require('../controllers/regvisitControllers');

router.get('/regvisit', regvisitHome);

router.get('/regvisit_lisa', regvisitAdd);

router.post('/regvisit_lisa', regvisitAddPost);

module.exports = router;
