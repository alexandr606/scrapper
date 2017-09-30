'use strict';

const Nightmare = require('nightmare');
const nightmare = new Nightmare({show: true });
const moment    = require('moment');

/*
 {
     balance: Float,
     clicks: Integer,
     expense: Float,
     ordersCount: Integer,
     ordersCost: String,
     ordersCharge: String
 }
 */

let yandex = async (password, login, shopId) => {
    try {
        await nightmare
            .goto(`https://partner.market.yandex.ru/order.xml?id=21322372`)
            .type('input[name="login"]', login)
            .type('input[name="passwd"]', password);

        let submitButton = await nightmare.exists('.domik-submit-button')
            ? '.domik-submit-button' : '.passport-Button';

        let cost = await nightmare.click(submitButton)
            .wait('.order-report-last')
            .evaluate(() => {
                let balance = document.querySelector('div.order-report-last div strong').innerText;
                let data = [...document.querySelectorAll('.statistic-tab_content table tbody tr ')]
                    .map( el => el.innerText);

                return { balance, data };
            });

        let rating = await nightmare
            .evaluate(() => {
                let rating = document.querySelector('div.order-report div.order-report-inner strong');
                return rating.innerText;
            });

        let orders = await nightmare
            .click(`a[href="/stat-orders.xml?id=21322372"]`)
            .wait('table.dt')
            .evaluate(() => {
                return [...document.querySelectorAll('table.dt tbody tr')]
                    .map( el => el.innerText );
            });

        await nightmare.end();

        let ordersResult = [];

        orders.splice(0, 8);

        orders.forEach( order => {
            let yesterday   = moment().clone().subtract(1, 'days').startOf('day');
            let formedOrder = __formOrderData(order);

            if(yesterday.diff(moment(formedOrder.oderDate, 'YYYY-MM-DD'), 'days') === 0) {
                ordersResult.push(formedOrder);
            }
        });

        console.log(cost);

        let expense = cost.data[cost.data.length-3].split('\t')[2];
        let clicks  = cost.data[0].split('\t')[2];

        console.log('yandex');
        return {
            catalogId       : 'yandex',
            balance         : parseFloat(cost.balance) || null,
            clicks          : parseInt(clicks, 10)|| null,
            rating          : parseFloat(rating) || null,
            expense         : parseFloat(expense)|| null,
            ordersCount     : ordersResult && ordersResult.length,
            ordersCharge    : ordersResult && ordersResult.length
                        && ordersResult.map(el => el.orderCharge)
                                        .reduce((sum, cur) => parseFloat(sum) + parseFloat(cur) ),
            ordersSum       : ordersResult && ordersResult.length
                        && ordersResult.map(el => el.orderCost)
                                       .reduce((sum, cur) => parseInt(sum, 10) + parseInt(cur, 10) )
        };

    } catch (err) {
        console.error(err);
    }
};

function __formOrderData(data) {
    console.log(data, 'lol')
    let $data           = data.split('\t');
    let date            = moment($data[0], 'DD.MM.YYYY').format('YYYY-MM-DD');
    let orderExpense    = $data[2].split(' ')[0].replace('\n', '');
    let orderCharge     = $data[4].replace(' у.е.', '');

    return {
        oderDate: date,
        orderCost: orderExpense,
        orderCharge: orderCharge
    };
}

module.exports = yandex;

