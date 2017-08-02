'use strict';

const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });
const moment = require('moment');

/*
 returning values
 {
     balance: Float,
     expense: Float
     ordersCount: Integer,
     ordersSum: Float
 }
*/

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
            .wait('dl.bill')
            .evaluate(()=> {
                return document.querySelector('dl.bill').innerText.split(':')[1]
            });

        let expence = await nightmare
            .goto('https://avto.pro/user-expenditure-details/')
            .wait('table')
            .click('#expenditure_statistics_daterange')
            .click('div.daterangepicker.dropdown-menu.opensright > div.ranges > ul > li:nth-child(1)')
            .click('#site_content > div > div.primary_part.no-third-col > article > form > button')
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

        let exp = expence && expence.length && expence[1].split('\t')[1];

        unformedOrders = filterRuOrders(unformedOrders);

        let formedOrders = __getYesterdayOrders( __formOrders(unformedOrders) );

        console.log('avtopro');
        return {
            catalogId   : 'avtopro',
            balance     : balance && parseFloat(balance.replace(',','.')) || null,
            expense     : exp && parseFloat(exp.replace('-','')) || null,
            ordersCount : formedOrders.length,
            ordersSum   : formedOrders.length && formedOrders
                .map(item => item.cost)
                .reduce( (sum, order) => {
                    return sum + parseFloat(order.cost);
                })
        }
    } catch (err) {
        console.log(err)
    }
};


function __formOrders (data) {

    if(!data || !data.length) {
        return {};
    };

    return data.map( order => {
        let temp = order.split('\n');
        let date = temp[1];
        let cost = temp[temp.length-2].replace(' UAH', '');

        return { date: date, cost: cost };
    });
}

function filterRuOrders (data) {

    if(!data || !data.length) {
        return {};
    };

    let result = [];

    data.forEach( order => {
        let temp = order.split('\n');

        if(temp.length && temp[temp.length-2] && !/UAH$/.test(temp[temp.length-2])) {
            result.push(order);
        }
    });

    return [];
}

function __getYesterdayOrders(data) {

    if(!data || !data.length) {
        return [];
    };

    let yesterday = moment().clone().subtract(1, 'days').startOf('day');

    let result = [];

    data.forEach( order => {
        let date = order.date.replace(/,*/, "");

        if(yesterday.diff(moment(date, 'DD.MM.YYYY'), 'days') === 0) {
            result.push(order);
        }
    });

    return result;
}

module.exports = avtoPro;