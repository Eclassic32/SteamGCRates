import fs from "fs";
import fetch from 'node-fetch';

const site = 'https://www.eneba.com/store/all';
const urlParam = 'drms[]=steam%20gift%20card&types[]=giftcard&regions';
const pageNum = 4;

func();

async function func() {
    for (let page = 4; page <= pageNum; page++) {
        const respose = await fetch(`${site}?page=${page}&${urlParam}`);
        const result = await respose.text();
        
        // await console.log(result);
        await fs.writeFileSync(`pages/page${page}.html`, result);
        await console.log(`Page ${page}`);
    }

    await console.log("done");
}