

const myCur = (checkLS('currency')) ? localStorage.getItem('currency') : 'KZT';
const roundTo = 2;    
fun(); 

async function fun() {
    const items = (checkLS('items')) ? JSON.parse(localStorage.getItem('items')) : await fetchData('json/data.json');
    const currency = await fetchData('json/currency.json');

    localStorage.setItem('items', JSON.stringify(items));

    for (let i = 0; i < items.length; i++) {
        items[i].AtoEUR = toEuro(items[i].amount, items[i].currency); 
        items[i].AtoKZT = fromEuro(items[i].AtoEUR, myCur).toFixed(roundTo); 
        items[i].PtoKZT = fromEuro(items[i].price, myCur).toFixed(roundTo);
        items[i].rate = items[i].AtoEUR / items[i].price;
    }
    const sortedItems = items.sort((a, b) => b.rate - a.rate);
    console.log(sortedItems);

    for (let i = 0; i < items.length; i++) {
        const el = items[i];
        
        $('tbody').append(`<tr><th>${i+1}</th><td>${el.country}</td><td>${el.region}</td>
        <td>${el.amount} ${el.currency}</td><td>${el.price} EUR</td><td>${el.AtoKZT} ${myCur}</td><td>${el.PtoKZT} ${myCur}</td>
        <td>${el.rate}</td><td><a href="${el.link}"> Link </a></td></tr>`)
    }

    function toEuro(amount, from) {
        return amount / currency.rates[from];
    }
    
    function fromEuro(amount, from) {
        return amount * currency.rates[from];
    }
}

function checkLS(name){
    return localStorage.getItem(name) != null || localStorage.getItem(name) != undefined;
}

async function fetchData(link) {
    try {
        const response = await fetch(link);
        const data = await response.json();
        // console.log(data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

