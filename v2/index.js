const myCur = checkLS("currency", "KZT");
const roundTo = checkLS("roundTo", 2);
const sortBy = checkLS("sort", "rate");

var products = [];
var auctions = {};

var endData = JSON.parse(checkLS("data", false, false));

main();

async function main() {
    // get currency rates
    const currency = (await fetch('currency.json')).json();

    // if endData empty get eneba pages
    if (JSON.stringify(endData) == "false") {
        endData = new Array();
        var pageNum = 1;

        const url = 'https://www.eneba.com/store/all?drms[]=steam%20gift%20card&types[]=giftcard&regions';

        console.log("data not found");

        for (let i = 0; i < pageNum; i++) {
            const file = (await fetch(`../pages/page${i+1}.html`)).text();
            if (pageNum == 1)
                pageNum = findLastPage(await file);
            jsonToPA(htmlToJSON(await file));
        } 
    }  

    // write gotten data into array
    for (const value in products) {
        if (Object.hasOwnProperty.call(products, value)) {
            const element = products[value];
            endData.push(findData(element));
        }
    }

    console.log(endData);

    localStorage.setItem("data", JSON.stringify(endData));

    // sort and display data
    writeCurrencyData(await currency);
    displayData();
}  
  

function htmlToJSON(file){
    const html = $(file);
    const item = html.filter('script#__APOLLO_STATE__');

    return item[0].text;
} 

function findLastPage(file) {
    return ($(file).find('li.rc-pagination-next').prev().find('a'))[0].text
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
    endData.sort((a, b) => b[sortBy] - a[sortBy]);

    for (let i = 0; i < endData.length; i++) {
        const el = endData[i];
        
        $('tbody').append(`<tr><th>${i+1}</th><td>${el.country}</td><td>${el.region}</td>
        <td>${el.amount} ${el.currency}</td><td>${el.price} EUR</td><td>${el.AtoLocal} ${myCur}</td><td>${el.PtoLocal} ${myCur}</td>
        <td>${el.rate}</td><td><a href="${el.link}"> Link </a></td></tr>`)
    }

    
}

function checkLS(name, def, sendDev = true){
    if (    localStorage.getItem(name) == null || localStorage.getItem(name) == false || 
            localStorage.getItem(name) == undefined || localStorage.getItem(name) == '' || 
            localStorage.getItem(name) == '{}' || localStorage.getItem(name) == '[]')
    {
        console.log(`Couldn't find '${name}' in Local Storage. Applying default '${def}'`);
        localStorage.setItem(name, def);
        return def;
    }
    (sendDev) ? console.log(`Fonud '${name}' in Local Storage: ` + localStorage.getItem(name)) : console.log(`Fonud '${name}' in Local Storage. (sendDev = false)`);
    return localStorage.getItem(name);
}