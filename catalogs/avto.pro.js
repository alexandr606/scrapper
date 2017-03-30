const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });
const moment = require('moment');

let avtoPro = async (login, password) => {
    try {
        let balance = await nightmare
            .viewport(1000, 500)
            .goto(`https://avto.pro`)
            .click('a[data-target="#log-in-form-container"')
            .wait('input[name="login"]')
            .type('input[name="login"]', login)
            .type('input[name="password"]', password)
            .click('button[type="submit"]')
            .wait(1000)
            .evaluate(()=> {
                return document.querySelector('dl.bill').innerText.split(':')[1];
            });

        let expence = await nightmare
            .goto('https://avto.pro/user-expenditure-details/')
            .evaluate(() => {
                return [...document.querySelectorAll('table.ustat-expenditure tbody tr')]
                    .map(el => el.innerText);
            });

        let unformedOrders = await nightmare
            .goto('https://avto.pro/orders/?offset=0#')
            .wait('.order-preview')
            .evaluate(() => {
                return [...document.querySelectorAll('.order-preview')]
                    .map(el => el.innerText);
            });

        await nightmare.end();

        let exp = expence[1].split('\t')[1];
        let formedOrders = __getYesterdayOrders( __formOrders(unformedOrders) );

        return {
            balance: balance,
            expence: exp,
            ordersCount: formedOrders.length,
            ordersSum: formedOrders.length && formedOrders.reduce( sum, order => {
                return sum + parseFloat(order.cost);
            })
        }
    } catch (err) {
        console.error(err)
    }
};


function __formOrders (data) {
    return data.map( order => {
        let temp = order.split('\n');
        let date = temp[1];
        let cost = temp[temp.length-2].replace(' UAH', '');

        return { date: date, cost: cost };
    });
}

function __getYesterdayOrders(data) {
    let yesterday = moment().clone().subtract(1, 'days').startOf('day');
    let result = [];

    data.forEach( order => {
        let date = order.date.replace(/,*/, "");

        if( yesterday.diff(moment(date, 'DD.MM.YYYY'), 'days') === 0) {
            result.push(order);
        }
    });

    return result;
}

module.exports = avtoPro;