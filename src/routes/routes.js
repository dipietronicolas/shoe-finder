const express = require('express');
const router = express.Router();
const { scrapShoes } = require('../utils/scrap-config');

router.get('/', (req, res) => {
    res.send('Hola mundo');
})

router.get('/find-shoes', async (req, res) => {
    await scrapShoes();
    res.send('Hola mundo');
})

module.exports = router;