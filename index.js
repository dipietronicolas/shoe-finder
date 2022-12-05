require('dotenv').config();
const express = require('express');
const router = require('./src/routes/routes');
const {
    scrapShoes,
} = require('./src/utils/scrap-config');
const app = express();


app.set('PORT', process.env.PORT || 5050);
app.use(router);

const autoScrapper = () => {
    setInterval(scrapShoes, 1800000)
}

app.listen(
    app.get('PORT'),
    () => {
        console.log(`listening on port ${app.get('PORT')}`);
        autoScrapper();
    }
)
