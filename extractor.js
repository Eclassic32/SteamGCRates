import fs from "fs";
import {load} from "cheerio";

const allItems = 259;
var result = new Array();

const files = fs.readdirSync('pages/');
for (let index = 0; index < allItems; index++) {
   result[index] = {};
}

for (let i = 0; i < files.length; i++) {
    const htmlFile = files[i];
    findData(i, htmlFile);
    console.log(htmlFile);
}

// console.log(result);

fs.writeFileSync('json/data.json', JSON.stringify(result));

function findData(page, htmlFile) {
    const html = fs.readFileSync(`pages/${htmlFile}`);
    const $ = load(html);
    const nameElements = $('.JZCH_t .uy1qit .x4MuJo .YLosEL');
    nameElements.each((index, element) => {
    const data = $(element).text();
    // console.log(data);
    result[index + (page * 20)].fullname = data;
    result[index + (page * 20)].amount = parseInt(data.match(/(\d+)/g)[0]);
    result[index + (page * 20)].currency = data.match(/\b[A-Z]+\b/g)[0];
    result[index + (page * 20)].countryText = data.match(/\b[A-Z]+\b/g).slice(1).join(' ');
    });

    const countryElements = $('.JZCH_t .uy1qit .x4MuJo .Pm6lW1');
    countryElements.each((index, element) => {
    const data = $(element).text();
    // console.log(data);
    result[index].country = data;
    });

    const priceElements = $('.JZCH_t .uy1qit .b3POZC .DTv7Ag .L5ErLT');
    priceElements.each((index, element) => {
    const data = $(element).text();
    // console.log(data);
    result[index].price = parseFloat(data.replace('€', ''));
    });

    const linkElements = $('.JZCH_t .uy1qit .b3POZC .oSVLlh');
    linkElements.each((index, element) => {
    const data = $(element).attr('href');
    // console.log(data);
    result[index].link = `https://eneba.com${data}`;
    });

    console.log(result);
}