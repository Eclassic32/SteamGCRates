var products = [];
var auctions = {};



main();

async function main() {
    const file = (await fetch('../pages/page1.html')).text();
    // console.log(htmlToJSON(await file));
}  
  

function htmlToJSON(file){
    const html = $(file);
    const item = html.filter('script#__APOLLO_STATE__');

    return item[0].text;
} 

function jsonToPA(text){
    const data = JSON.parse($(text).text());
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