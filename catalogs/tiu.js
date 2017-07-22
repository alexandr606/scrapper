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
        let olVersionSelector = 'span.b-label_type_header-version';
        let oldVersionLink    = 'https://my.tiu.ru/cabinet/order?version_type=old_version';
        let newVersionLink    = 'https://my.tiu.ru/cabinet/order?version_type=new_version';

        let start = await nightmare
            .goto(`https://my.tiu.ru/cabinet/order_v2`)
            .wait('#phone_email')
            .type('#phone_email', login)
            .type('#password', password)
            .click('#submit_login_button')
            .wait(1000);

        let isNewVersion = nightmare.exists('span.b-label_type_header-version a');

        if(isNewVersion) {
            await nightmare.goto(oldVersionLink)
                .wait(1000);
        }

        await nightmare.goto(`https://my.tiu.ru/cabinet/order/list?per_page=100`)
            .wait(1000);

        let res = await nightmare.evaluate(() => {
                return [...document.querySelectorAll("tr[id^='item_']")]
                    .map(el => el.innerText);
            });

        if(isNewVersion) {
            await nightmare.goto(newVersionLink)
                .wait(1000);
        };

        await nightmare.end();

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

    let cost;

    if($data[3]) {
        cost = $data[3].replace(/\s/g, '');

        if(/\$/.test($data[3])) {
            cost = parseInt( cost.replace('$','') ) * 58.43;
        } else {
            cost = parseInt( cost.replace('руб.','') );
        }
    }

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

    return moment(date, 'DD.MM.YYYY hh:mm').format('YYYY-MM-DD');
}

module.exports = tiu;