const puppeteer = require('puppeteer');
const { sendMessage, sendMessageWithMedia } = require('./message.service');
// Array that saves previos search
let previousSearch = [];
// Pages to scrap
const moovPagesContainer = [
    'https://www.moov.com.ar/hombre/calzado/zapatillas/nike+hombre',
    'https://www.moov.com.ar/hombre/calzado/zapatillas/nike+hombre?start=36'
];

const gridPagesContainer = [
    'https://www.grid.com.ar/calzado/jordan/nike/nike-sportswear/hombre?initialMap=category-1,genero&initialQuery=calzado/hombre&map=category-1,brand,brand,brand,genero&order=OrderByReleaseDateDESC'
]

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
    const browser = await puppeteer.launch(
        {
            headless: false,
        }
        /*
        args: ['--no-sandbox']
        */
    );
    const page = await browser.newPage();
    const gridScrappedLinks = await gridScrapper(page);
    const moovScrappedLinks = await moovScrapper(page);
/*
    const previousSearchMapped = previousSearch.map(prev => prev.imageUrl)
    const filteredLinks = scrappedLinks.filter((link) => {
        return !previousSearchMapped.includes(link?.imageUrl);
    })
*/
    sendMessageWithMedia([ ...gridScrappedLinks, ...moovScrappedLinks]);
    await browser.close();
    // previousSearch = scrappedLinks;
}

const gridScrapper = async (page) => {
    const productContainer = '.vtex-search-result-3-x-galleryItem';
    const resultsSelector = '.vtex-product-summary-2-x-productBrand';
    let links = [];

    for (const url of gridPagesContainer) {
        await page.goto(url);
        await page.waitForSelector(resultsSelector);
        // Extract the results from the page.
        const newLinks = await page.evaluate(resultsSelector => {
            return [...document.querySelectorAll(resultsSelector)].map(container => {
                const title = container.getElementsByTagName('span')[1].textContent;
                const imageUrl = container.getElementsByTagName('img')[0].currentSrc;
                return {
                    title,
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

const moovScrapper = async (page) => {
    const productContainer = '.product-tile';
    const resultsSelector = '.pdp-link';
    let links = [];

    for (const url of moovPagesContainer) {
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