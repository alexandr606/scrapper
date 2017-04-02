'use strict';

const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });
const moment    = require('moment');

let zzap = async (login, password) => {

    try {
        let balance = await nightmare
            .goto('https://www.zzap.ru/user/money.aspx')
            .wait('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_AddrEmail1TextBox_I')
            .type('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_AddrEmail1TextBox_I', login)
            .wait('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_PasswordTextBox_I')
            .type('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_PasswordTextBox_I', password)
            .click('.dx-vam')
            .wait('#MessagePopupButton_I')
            .click('#MessagePopupButton_I')
            .wait(5000)
            .evaluate(() => {
                return [...document.querySelectorAll('#ctl00_BodyPlace_Information b')][1].innerText;
            });

        let orders = await nightmare
            .goto('https://www.zzap.ru/user/ordersget.aspx')
            .wait(3000)
            .evaluate(() => {
                return [...document.querySelectorAll('table#ctl00_BodyPlace_OrdersGridView_DXMainTable tbody tr.dxgvDataRow_ZzapAqua')]
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

        return {
            balance: parseFloat(balance.split(' ')[0]),
            orders: resultOrders
        };

    } catch (err) {
        console.error(err);
    }

};

function __formOrdersResult(data) {
    if(!data) {
        return [];
    }

    let arrData = data.split('\t');

    let costData = parseInt(arrData[7].split('\n')[1].replace(' ', ''), 10);

    return {
        date: arrData[1],
        cost: costData
    }
}


module.exports = zzap;