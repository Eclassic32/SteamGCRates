var products = [];
var auctions = {};



main();

async function main() {
    const file = (await fetch('../pages/page1.html')).text();
    // console.log(htmlToData(await file));
}  
  

function htmlToData(file){
    const html = $(file);
    const item = html.filter('script#__APOLLO_STATE__');

    return item[0].text;
} 