'use strict';

const moment = require('moment');
const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true, waitTimeout: 150000 });

let avtoProRu = async (params) => {

    let { password, login, id: catalogID } = params;

    try {
        let balance         = await getBalance(nightmare, login, password);
        let bonus           = await getBonus(nightmare);
        let expence         = await getExpense(nightmare);
        let unformedOrders  = await getUnformedOrders(nightmare);
        await logout(nightmare);

        await nightmare.end();

        let exp = __getCorrectExpense(expence);

        let formedOrders = [];

        if(unformedOrders && unformedOrders.length) {
            unformedOrders = filterRuOrders(unformedOrders);

            formedOrders = __getYesterdayOrders( __formOrders(unformedOrders) );
        }

        let summaryBalance = parseFloat(balance.replace(',','.')) + parseFloat(bonus);

        return {
            catalogId   : catalogID,
            balance     : summaryBalance || null,
            expense     : exp,
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

let logout = function (nightmare) {
    return nightmare.goto('https://avto.pro/.aspx?logout=true')
        .wait(1000);
}

let getUnformedOrders = function (nightmare) {
    return nightmare
        .goto('https://avto.pro/orders/?offset=0#')
        .wait(1000)
        .evaluate(() => {
            return [...document.querySelectorAll('.order-preview')]
                .map(el => el.innerText);
        });
}

let getBonus = function (nightmare) {
    return nightmare.evaluate(()=> {
        let bonus = document.querySelector('dl.bill:nth-child(2) dd.pull-right');
        if(bonus) {
            return bonus.innerText && bonus.innerText.replace(',','.');
        }

        return 0;
    });
}

let getExpense = function (nightmare) {
    return nightmare
        .goto('https://avto.pro/user-expenditure-details/')
        .wait('table')
        .click('#expenditure_statistics_daterange')
        .click('body > div.daterangepicker.dropdown-menu.opensright > div.ranges > ul > li:nth-child(1)')
        .click('#site_content > div > div.grid__cell.grid__cell--2.grid__cell--grow > div > div:nth-child(1) > article > form > button')
        .evaluate(() => {
            return [...document.querySelectorAll('table.ustat-expenditure tbody tr')]
                .map(el => el.innerText);
        });
}

let getBalance = function (nightmare, login, password) {
    return nightmare
        .viewport(1200, 500)
        .goto(`https://avto.pro`)
        .wait(1000)
        .click('a[data-target="#log-in-form-container"]')
        .wait('#log-in-form-container > div:nth-child(1) > form > div:nth-child(1) > label > input[type="text"]')
        .type('#log-in-form-container > div:nth-child(1) > form > div:nth-child(1) > label > input[type="text"]', login)
        .type('#log-in-form-container > div:nth-child(1) > form > div:nth-child(2) > label > input[type="password"]', password)
        .click('#log-in-form-container > div:nth-child(1) > form > div:nth-child(3) > button')
        .wait('dl.bill')
        .evaluate(()=> {
            return document.querySelector('dl.bill:nth-child(1) dd.pull-right').innerText;
        });
}

function __getCorrectExpense (exp) {
    if(!exp.length) {
        return 0;
    }

    let expenseOne = exp[0].split('\t');
    let expenseTwo = exp[1] && exp[1].length && exp[1].split('\t') || 0;

    let cost;

    if(__testExpense(expenseOne)) {
        cost = expenseOne[1] && parseFloat(expenseOne[1].replace('-',''));
    } else if(__testExpense(expenseTwo)){
        cost = expenseTwo[1] && parseFloat(expenseTwo[1].replace('-',''));
    } else {
        cost = 0;
    }

    return cost;
}

function __testExpense(expense) {
    if(expense) {
        let expenseDate = expense[0].split(' ');

        let date = moment(
            [
                Number(expenseDate[2]),
                Number(dates[expenseDate[1]]),
                Number(expenseDate[0])
            ]
        ).format('YYYY-MM-DD');

        let yesterday = moment().subtract(1, 'days').startOf('day');

        return yesterday.diff(moment(date, 'YYYY-MM-DD'), 'days') === 0;
    }

    return null;
}


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

const dates = {
    'декабря'   : '11',
    'ноября'    : '10',
    'октября'   : '09',
    'сентября'  : '08',
    'августа'   : '07',
    'июля'      : '06',
    'июня'      : '05',
    'мая'       : '04',
    'апреля'    : '03',
    'марта'     : '02',
    'февраля'   : '01',
    'января'    : '00',
};


module.exports = avtoProRu;