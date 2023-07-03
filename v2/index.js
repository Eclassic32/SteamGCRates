const myCur = checkLS("currency", "KZT");
const roundTo = checkLS("roundTo", 2);
const sortBy = checkLS("sort", "rate");
const sortText = checkLS("sortText", false)

const maxPrice = 0;
const minPrice = 0;

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

        // const url = 'https://www.eneba.com/store/all?drms[]=steam%20gift%20card&types[]=giftcard&regions';

        console.log("data not found");

        for (let i = 0; i < pageNum; i++) {
            // const file = (await fetch(`${url}&page=${i+1}`)).text(); // not working eneba fetch
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
            if (data[key].cheapestAuction == null) 
                continue;
            products.push(data[key]);
        }
        else {
            auctions[key] = data[key]['price({\"currency\":\"EUR\"})'];
        }
    }
}

function findData(item) {

    var data = {
        id       : endData.length + 1,
        name     : item.name,
        region   : item.regions[0].name,
        country  : item.name.match(/\b[A-Z]+\b/g).slice(1).join(' '),
        currency : item.name.match(/\b[A-Z]+\b/g)[0],
        amount   : parseInt(item.name.match(/(\d+)/g)[0]),
        price    : (auctions[item.cheapestAuction.__ref].amount) / 100,
        link     : `https://eneba.com/${item.slug}`};

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

    if (sortText) 
        endData.sort(function(a, b) {
            return a[sortBy].localeCompare(b[sortBy]);
        });
    else 
        endData.sort((a, b) => b[sortBy] - a[sortBy]);

    const sortedData = endData.filter(function(obj) {
        return (obj.price <= maxPrice || maxPrice == 0) && (obj.price >= minPrice);
    })

    $("#foundItems").text(sortedData.length)

    for (let i = 0; i < sortedData.length; i++) {
        const el = sortedData[i];
        
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