import fs from "fs";
import {load} from "cheerio";

const files = fs.readdirSync('pages/');
var result = new Array();

var products = [];
var auctions = {};

for (let i = 0; i < files.length; i++) {
    const htmlFile = files[i];
    console.log(htmlFile);
    extractData(htmlFile);
}

for (const value in products) {
    if (Object.hasOwnProperty.call(products, value)) {
        const element = products[value];
        result.push(findData(element));
    }
}

// console.log(products, auctions);
// console.log(result);
fs.writeFileSync('json/data.json', JSON.stringify(result));

function extractData(htmlFile){
    const html = fs.readFileSync(`pages/${htmlFile}`);
    const $ = load(html);
    const elements = $('#__APOLLO_STATE__');
    elements.each((index, element) => {
        const data = JSON.parse($(element).text());
        // console.log(data);

        delete data.ROOT_QUERY;

        for (const key in data) {
            if (key.includes('Product')) {
                products.push(data[key]);
            }
            else {
                auctions[key] = data[key]['price({\"currency\":\"EUR\"})'];
            }
        }

    });
}

function findData(element) {
    var data = {};
    data.name = element.name;
    data.region = element.regions[0].name;
    data.country = element.name.match(/\b[A-Z]+\b/g).slice(1).join(' ');
    data.currency = element.name.match(/\b[A-Z]+\b/g)[0];
    data.amount = parseInt(element.name.match(/(\d+)/g)[0]);
    data.price = (auctions[element.cheapestAuction.__ref].amount) / 100;
    data.link = `https://eneba.com/${element.slug}`

    console.log(data);
    return data;
}