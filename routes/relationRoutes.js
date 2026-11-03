const express = require('express');
const router = express.Router();

const {
	relationHome,
	relationAdd,
	relationAddPost} = require('../controllers/relationControllers');

router.route('/relation').get(relationHome);

router.route('/relation_lisa').get(relationAdd);

router.route('/relation_lisa').post(relationAddPost);

module.exports = router;