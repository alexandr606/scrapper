'use strict';

const pool = require('../lib/db');

let addData = (data) => {

    let query = `INSERT INTO data`;

    let fields = [];
    let values = [];

    if(!data.catalogId) {
        throw new Error('No catalog id passed');
    }

    if(!data.shopId) {
        throw new Error('No shop id passed');
    }

    if(typeof data.balance !== 'undefined') {
        fields.push('balance');
        values.push(data.balance);
    }

    if(typeof data.expense !== 'undefined') {
        fields.push('expense');
        values.push(data.expense);
    }

    if(typeof data.clicks !== 'undefined') {
        fields.push('clicks');
        values.push(data.clicks);
    }

    if(typeof data.ordersCount !== 'undefined') {
        fields.push('orders_count');
        values.push(data.ordersCount);
    }

    if(typeof data.ordersSum !== 'undefined') {
        fields.push('orders_sum');
        values.push(data.ordersSum);
    }

    if(fields.length) {
        query += ` (${fields.join(', ')}, date, catalog_id, shop_id) `;
        query += `VALUES (${values.join(', ')}, NOW(), '${data.catalogId}', '${data.shopId}') `;
    } else {
        query += `(date, catalog_id, shop_id) VALUES ( NOW(), '${data.catalogId}', '${data.shopId}')`
    }

    return pool.query(query, null, function (err, res) {
        if(err) {
            throw new Error(err);
        }

        return res.rowCount;
    });
};

module.exports = addData;