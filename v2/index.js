var products = [];
var auctions = {};

var endData = new Array();
var unsortedData;
var sortedData;


main();

async function main() {
    const file = (await fetch('../pages/page1.html')).text();
    // console.log(htmlToJSON(await file));

    jsonToPA(htmlToJSON(await file));

    console.log(products);
    console.log(auctions);
}  
  

function htmlToJSON(file){
    const html = $(file);
    const item = html.filter('script#__APOLLO_STATE__');

    return item[0].text;
} 

function jsonToPA(text){
    const data = JSON.parse(text);
    delete data.ROOT_QUERY;

    for (const key in data) {
        if (key.includes('Product')) {
            products.push(data[key]);
        }
        else {
            auctions[key] = data[key]['price({\"currency\":\"EUR\"})'];
        }
    }
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