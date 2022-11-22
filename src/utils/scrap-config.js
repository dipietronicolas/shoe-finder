const puppeteer = require('puppeteer');
const { sendMessage, sendMessageWithMedia } = require('./message.service');
// Array that saves previos search
let previousSearch = [];
// Pages to scrap
const pagesContainer = [
    'https://www.moov.com.ar/hombre/calzado/zapatillas/nike+hombre',
    'https://www.moov.com.ar/hombre/calzado/zapatillas/nike+hombre?start=36'
];

const scrapNames = (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let links = [];

    for (const url of pagesContainer) {
        await page.goto(url);
        const resultsSelector = '.link';
        await page.waitForSelector(resultsSelector);
        // Extract the results from the page.
        const newLinks = await page.evaluate(resultsSelector => {
            return [...document.querySelectorAll(resultsSelector)].map(anchor => {
                const title = anchor.textContent.split('|')[0].trim();
                return `${title} - ${anchor.href}`;
            });
        }, resultsSelector);
        links = [
            ...links,
            ...newLinks.filter(link => {
                return link.toLowerCase().includes('jordan')
            })
        ]
    }
    // Print all the files.
    await browser.close();
    const results = links.join('\n');
    sendMessage(results);
});

const scrapShoes = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    let links = [];
    
    const scrappedLinks = await moovScrapper(page, links);

    const previousSearchMapped = previousSearch.map(prev => prev.imageUrl)
    const filteredLinks = scrappedLinks.filter((link) => {
        return !previousSearchMapped.includes(link?.imageUrl) ;
    })
    sendMessageWithMedia(filteredLinks);
    await browser.close();
    previousSearch = scrappedLinks;
}

const moovScrapper = async (page, links) => {
    const productContainer = '.product-tile';
    const resultsSelector = '.pdp-link';

    for (const url of pagesContainer) {
        await page.goto(url);
        await page.waitForSelector(resultsSelector);
        // Extract the results from the page.
        const newLinks = await page.evaluate(resultsSelector => {
            return results = [...document.querySelectorAll(resultsSelector)].map(container => {
                const imageUrl = container.getElementsByTagName('img')[0].currentSrc;
                const anchor = container.getElementsByTagName('a')[3];
                const title = anchor.textContent.split('|')[0].trim();
                return {
                    title,
                    link: anchor.href,
                    imageUrl,
                }
            });
        }, productContainer);
        links = [
            ...links,
            ...newLinks.filter(element => {
                return element.title.toLowerCase().includes('jordan')
            })
        ]
    }
    return links;
}

module.exports = {
    scrapNames,
    scrapShoes,
};