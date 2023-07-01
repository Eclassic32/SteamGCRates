const myCur = checkLS("currency", "KZT");
const roundTo = checkLS("roundTo", 0);
const sortBy = checkLS("sort", "rate");

var products = [];
var auctions = {};

var endData = new Array();

main();

async function main() {
    // get currency rates
    const currency = (await fetch('currency.json')).json();

    // get eneba pages
    const file = (await fetch('../pages/page1.html')).text();
    jsonToPA(htmlToJSON(await file));

    // write gotten data into array
    for (const value in products) {
        if (Object.hasOwnProperty.call(products, value)) {
            const element = products[value];
            endData.push(findData(element));
        }
    }

    // sort and display data
    writeCurrencyData(await currency);
    displayData();
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
    data.id = endData.length + 1;
    data.name = element.name;
    data.region = element.regions[0].name;
    data.country = element.name.match(/\b[A-Z]+\b/g).slice(1).join(' ');
    data.currency = element.name.match(/\b[A-Z]+\b/g)[0];
    data.amount = parseInt(element.name.match(/(\d+)/g)[0]);
    data.price = (auctions[element.cheapestAuction.__ref].amount) / 100;
    data.link = `https://eneba.com/${element.slug}`

    // console.log(data);
    return data;
}

function writeCurrencyData(currency){
    

    for (let i = 0; i < endData.length; i++) {
        endData[i].AtoEUR = toEuro(endData[i].amount, endData[i].currency); 
        endData[i].AtoLocal = fromEuro(endData[i].AtoEUR, myCur).toFixed(roundTo); 
        endData[i].PtoLocal = fromEuro(endData[i].price, myCur).toFixed(roundTo);
        endData[i].rate = endData[i].AtoEUR / endData[i].price;
    }

    function toEuro(amount, localCurrency) {
        return amount / currency.rates[localCurrency];
    }
    
    function fromEuro(amount, localCurrency) {
        return amount * currency.rates[localCurrency];
    }
}

function displayData(){
    const sortedItems = endData.sort((a, b) => b[sortBy] - a[sortBy]);
    console.log(sortedItems);

    for (let i = 0; i < endData.length; i++) {
        const el = endData[i];
        
        $('tbody').append(`<tr><th>${el.id}</th><td>${el.country}</td><td>${el.region}</td>
        <td>${el.amount} ${el.currency}</td><td>${el.price} EUR</td><td>${el.AtoLocal} ${myCur}</td><td>${el.PtoLocal} ${myCur}</td>
        <td>${el.rate}</td><td><a href="${el.link}"> Link </a></td></tr>`)
    }

    
}

function checkLS(name, def){
    if (localStorage.getItem(name) == null || localStorage.getItem(name) == undefined || localStorage.getItem(name) == '' || localStorage.getItem(name) == '{}' || localStorage.getItem(name) == '[]'){
        console.log(`Couldn't find '${name}' in Local Storage. Applying default '${def}'`);
        localStorage.setItem(name, def);
        return def;
    }
    console.log(`Fonud '${name}' in Local Storage: ` + localStorage.getItem(name));
    return localStorage.getItem(name);
}