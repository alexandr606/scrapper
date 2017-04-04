'use strict';

const Nightmare = require('nightmare');
const moment    = require('moment');
const nightmare = new Nightmare({ show: true });
const config    = require('../config.json');

/*
 returning values
 {
     ordersCount: Integer,
     ordersSum: Float
 }
 */

let tiu = async (login, password) => {
    try {
        let res = await nightmare
            .goto(`https://my.tiu.ru/cabinet/order_v2`)
            .wait('#phone_email')
            .type('#phone_email', login)
            .type('#password', password)
            .click('#submit_login_button')
            .wait(1000)
            .goto(`https://my.tiu.ru/cabinet/order_v2#All`)
            .wait(1000)
            .evaluate(() => {
                return [...document.querySelectorAll('.b-orders__table tbody tr.b-orders__table-row')]
                    .map( el => el.innerText );
            })
            .end();

        let result = [];

        if(!res || !res.length) {
            return [];
        }

        res.forEach( item => {
            let formedResult    = __formElementOut(item);
            let yesterday       = moment().clone().subtract(1, 'days').startOf('day');

            if(yesterday.diff(moment(formedResult.date, 'YYYY-MM-DD'), 'days') === 0) {
                result.push(formedResult);
            }
        });

    return {
        catalogId   : 'tiu',
        ordersCount : result.length || 0,
        ordersSum   : result && result.length && result.map( order => parseFloat(order.cost))
            .reduce((sum, cur) => sum + cur ) || 0
    };

    } catch (err) {
        console.error(err)
    }
};



function __formElementOut(data) {

    if(!data) {
        throw new Error('Tiu Error. No data for __formElementOut function');
    }

    if(!data.length) {
        throw new Error('Tiu Error. Empty data for __formElementOut function');
    }

    let $data   = data.split('\n');
    let cost    = parseInt($data[5].split(' ')[0]);
    let date    = __convertDate($data[1]);

    return {
        date: date,
        cost: cost
    };
}

function __convertDate(date) {

    if(!date) {
        return 'Empty date';
    }

    let splittedDate = date.split(' ');

    if(splittedDate.length !== 2) {
        return 'Invalid date';
    }

    let day = splittedDate[0];
    let month = dates[date.split(' ')[1]];
    return moment([config.year, month, day]).format('YYYY-MM-DD');
}

const dates = {
    'дек.': '11',
    'нояб.': '10',
    'окт.': '09',
    'сент.': '08',
    'авг.': '07',
    'июля.': '06',
    'июня.': '05',
    'мая': '04',
    'апр.': '03',
    'марта': '02',
    'февр.': '01',
    'янв.': '00',
};

module.exports = tiu;