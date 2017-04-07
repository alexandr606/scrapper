'use strict';

const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });
const moment    = require('moment');

/*
 returning values
 {
 balance: Float,
 ordersCount: Integer,
 ordersSum: Integer
 }
*/

let zzap = async (login, password) => {

    try {
        let balance = await nightmare
            .goto('https://www.zzap.ru/user/money.aspx')
            .wait('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_AddrEmail1TextBox_I')
            .type('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_AddrEmail1TextBox_I', login)
            .wait('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_PasswordTextBox_I')
            .type('#ctl00_BodyPlace_LogonFormCallbackPanel_LogonFormLayout_PasswordTextBox_I', password)
            .click('.dx-vam')
            .wait(2000)
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
        console.log('zzap');

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

    let arrData = data.split('\t');

    let costData = parseInt(arrData[7].split('\n')[1].replace(' ', ''), 10);

    return {
        date: arrData[1],
        cost: costData
    }
}


module.exports = zzap;