'use strict';

const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });
const moment    = require('moment');

/*
 {
     balance: Float,
     clicks: Integer,
     expense: Float,
     ordersCount: Integer,
     ordersCost: String
 }
 */

let yandex = async (password, login, shopId) => {
    try {
        let cost = await nightmare
            .goto(`https://partner.market.yandex.ru/order.xml?id=${shopId}`)
            .type('input[name="login"]', login)
            .type('input[name="passwd"]', password)
            .click('.domik-submit-button')
            .wait('a[href="/shop.xml?id=21322372"]')
            .click('a[href="/shop.xml?id=21322372"]')
            .wait('.order-report-last')
            .evaluate(() => {
                let balance = document.querySelector('.order-report-last div strong').innerText;
                let data = [...document.querySelectorAll('.statistic-tab_content table tbody tr ')]
                    .map( el => el.innerText);

                let cost = data[data.length-3].split('\t')[2];
                let clicks = data[0].split('\t')[2];
                return { balance, cost, clicks };
            });

        let orders = await nightmare
            .click(`a[href="/orders-list.xml?id=21322372"`)
            .wait('.orders__body')
            .evaluate(() => {
                return [...document.querySelectorAll('.orders__body tr')]
                    .map( el => {
                        return {
                            all: el.innerText,
                            cost: el.querySelector('div.order-price').innerText
                        }
                    });
            });

        await nightmare.end();

        let ordersResult = [];

        orders.forEach( order => {
            let yesterday = moment().clone().subtract(1, 'days').startOf('day');
            let formedOrder = __formOrderData(order);

            if(yesterday.diff(moment(formedOrder.oderDate, 'YYYY-MM-DD'), 'days') === 0) {
                ordersResult.push(formedOrder.orderCost);
            }
        });

        return {
            catalogId: 'yandex',
            balance: parseFloat(cost.balance) || null,
            clicks: parseInt(cost.clicks, 10)|| null,
            expense: parseFloat(cost.cost)|| null,
            ordersCount: ordersResult && ordersResult.length,
            ordersCost: ordersResult && ordersResult.length
                        && ordersResult.reduce((sum, cur) => parseInt(sum, 10) + parseInt(cur, 10) )
        };

    } catch (err) {
        console.error(err);
    }
};

function __formOrderData(data) {
    let $data           = data.all.split('\t');
    let date            = moment($data[2], 'DD.MM.YYYY').format('YYYY-MM-DD');
    let orderExpense    = data.cost.split(' ')[0];

    return {
        oderDate: date,
        orderCost: orderExpense
    };
}


module.exports = yandex;


