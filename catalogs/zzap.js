'use strict';

const moment    = require('moment');
const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true, waitTimeout: 150000 });

/*
 returning values
 {
 balance: Float,
 ordersCount: Integer,
 ordersSum: Integer
 }
*/

let zzap = async (params) => {
    let { login, password } = params;

    try {
        let balance = await nightmare
            .viewport(1000, 500)
            .goto('https://www.zzap.ru/user/money.aspx')
            .wait('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_AddrEmail1TextBox_I')
            .type('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_AddrEmail1TextBox_I', login)
            .wait('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_PasswordTextBox_I')
            .type('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_PasswordTextBox_I', password)
            .click('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_LogonButton_CD')
            .wait('#MessagePopupButton')
            .click('#MessagePopupButton')
            .wait(5000)
            .evaluate(() => {
                return [...document.querySelectorAll('#ctl00_BodyPlace_Information b')][1].innerText;
            });

        let orders = await nightmare
            .goto('https://www.zzap.ru/user/ordersget.aspx')
            .wait(3000)
            .evaluate(() => {
                return [...document.querySelectorAll('tr[id^="ctl00_BodyPlace_OrdersGridView_DXDataRow"]')]
                    .map(el => el.innerText);
            });

        await nightmare.end();

        let resultOrders = [];

        let formedOrders = orders.map( item => {
            return __formOrdersResult(item);
        });

        formedOrders.forEach( item => {
            let yesterday = moment().clone().subtract(1, 'days').startOf('day');

            if( yesterday.diff(moment(item.date, 'DD-MM-YY'), 'days') === 0 ) {
                resultOrders.push(item);
            }
        });
        console.log('zzap');

        balance = balance.replace(' ', '');

        return {
            catalogId   : 'zzap',
            balance     : balance && parseFloat(balance.split(' ')[0]),
            ordersCount : resultOrders && resultOrders.length,
            ordersSum   : resultOrders && resultOrders.length
                            && resultOrders.map( item => item.cost )
                                .reduce( (sum, item) => {
                                    return sum + item;
                                })
        };

    } catch (err) {
        console.error(err);
    }

};

function __formOrdersResult(data) {
    if(!data) {
        return [];
    }

    let arrData = data.split('\t').filter( item => {
        return item !== '';
    });

    let formattedCost = arrData[5].split('\n').filter(item => {
        return item !== '';
    });

    let costData = Number(formattedCost[1].replace(' ', '').replace('р.', ''));

    return {
        date: arrData[1],
        cost: costData
    }
}


module.exports = zzap;