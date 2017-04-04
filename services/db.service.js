'use strict';

const pool = require('../lib/db');

let addData = () => {

    let data = {
        catalogId: 'yandex',
        shopId: 'lol',
        balance: 123,
        expense: 123.23
    };

    let query = `INSERT INTO data`;

    let fields = [];
    let values = [];

    if(!data.catalogId) {
        throw new Error('No catalog id passed');
    }

    if(!data.shopId) {
        throw new Error('No shop id passed');
    }

    if(data.balance) {
        fields.push('balance');
        values.push(data.balance);
    }

    if(data.expense) {
        fields.push('expense');
        values.push(data.expense);
    }

    if(data.clicks) {
        fields.push('clicks');
        values.push(data.clicks);
    }

    if(data.ordersCount) {
        fields.push('orders_count');
        values.push(data.ordersCount);
    }

    if(data.ordersSum) {
        fields.push('orders_sum');
        values.push(data.ordersSum);
    }

    query += ` (${fields.join(', ')}, date, catalog_id, shop_id) `;
    query += `VALUES (${values.join(', ')}, NOW(), '${data.catalogId}', '${data.shopId}') `;

    return pool.query(query, function (err, res) {
        if(err) {
            throw new Error(err);
        }

        return res.rowCount;
    });
};

module.exports = addData;