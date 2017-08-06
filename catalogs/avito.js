'use strict';

const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });
const moment = require('moment-timezone');

const TIMEZONE = 'Europe/Kiev';

/*
returning values
{
  balance: Float,
  expense: Integer,
  clicks: Integer
}
*/

let avito = async (login, password) => {
    try {
        let balance = await nightmare
            .goto('https://www.avito.ru/profile/context/campaigns')
            .type('input[name="login"]', login)
            .type('input[name="password"]', password)
            .click('.login-form-submit')
            .wait('span.context-balance__value')
            .evaluate(() => {
                return document.querySelector('span.context-balance__value').innerText;
            });

        let expense = await nightmare
            .goto('https://www.avito.ru/profile/context/stats')
            .evaluate(() => {
                return [...document.querySelectorAll('table.context-table tbody tr')]
                    .map(el => el.innerText);
            });

        await nightmare.end();

        let formedExpence = [];

        expense.forEach( item => {
            let formed = __formExpense(item);
            let yesterday = moment.tz(moment(), TIMEZONE).clone().subtract(1, 'days').startOf('day');

            if( yesterday.diff(moment(formed.date, 'YYYY-MM-DD'), 'days') === 0 ) {
                formedExpence = formed;
            }
        });
        console.log('avito');

        return {
            catalogId   : 'avito',
            balance     : balance && parseFloat(balance.replace(' ', '')),
            expense     : formedExpence.cost || 0,
            clicks      : parseInt(formedExpence.clicks, 10) || 0
        };

    } catch (err) {
        console.error(err);
    }
};

function __formExpense(data) {
    let tempData = data.split('\t');
    let tempDate = tempData[0].split(' ');

    let date    = moment([tempDate[2], parseInt(dates[tempDate[1]]), tempDate[0]]).format('YYYY-MM-DD');
    let cost    = parseFloat(tempData[tempData.length-1]);
    let clicks  = tempData[2];

    return {
        clicks  : clicks,
        date    : date,
        cost    : cost
    };
};

const dates = {
    'декабря': '11',
    'ноября': '10',
    'октября': '09',
    'сентября': '08',
    'августа': '07',
    'июля': '06',
    'июня': '05',
    'мая': '04',
    'апреля': '03',
    'марта': '02',
    'февраля': '01',
    'января': '00',
};

module.exports = avito;