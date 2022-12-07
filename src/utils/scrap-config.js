const puppeteer = require('puppeteer');
const { NODE_ENVIRONMENTS } = require('./constants');
const { sendMessageWithMedia } = require('./message.service');
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

const puppeteerDevLaunchConfig = {
    headless: false,
}

const puppeteerProdLaunchConfig = {
    headless: true,
    args: ['--no-sandbox']
}

const scrapShoes = async () => {
    console.log('scrapping..');
    const browser = await puppeteer.launch(
        process.env.NODE_ENV === NODE_ENVIRONMENTS.DEVELOPMENT
            ? puppeteerDevLaunchConfig
            : puppeteerProdLaunchConfig
    );

    const page = await browser.newPage();
    const gridScrappedLinks = await gridScrapper(page);
    const moovScrappedLinks = await moovScrapper(page);

    const previousSearchMapped = previousSearch.map(prev => prev.title)
    const filteredLinks = [
        ...gridScrappedLinks,
        ...moovScrappedLinks,
    ].filter((link) => {
        return !previousSearchMapped.includes(link.title);
    })
    sendMessageWithMedia(filteredLinks);
    await browser.close();
    previousSearch = [...gridScrappedLinks, ...moovScrappedLinks];
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
                const anchor = container.getElementsByTagName('a')[0];
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
                return (
                    element.title.toLowerCase().includes('jordan') ||
                    element.title.toLowerCase().includes('dunk') ||
                    element.title.toLowerCase().includes('force')
                )
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
                return (
                    element.title.toLowerCase().includes('jordan') ||
                    element.title.toLowerCase().includes('dunk') ||
                    element.title.toLowerCase().includes('force')
                )
            })
        ]
    }
    return links;
}

module.exports = {
    scrapShoes,
};