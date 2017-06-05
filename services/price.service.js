'use strict';
const config = require('./config');

const mysql  = require('mysql');

module.exports.saveLinks = function (data) {
    let connection = mysql.createConnection(config);

    let query =`INSERT INTO links (link) VALUES ?`;

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    connection.query(query, [data], function (error, results, fields) {
        console.log(results);
        console.log(error);
        if (error) throw error;
        return results.rowCount;
    });

    connection.end();
};

module.exports.getLinks = function (done) {
    let connection = mysql.createConnection(config);

    let query = `SELECT link FROM links`;

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    connection.query(query, function (error, results, fields) {
         //console.log(results);
         console.log(error);
        if (error) throw error;
        done(results);
    });

    connection.end();
};

module.exports.saveParsedData = function (data) {
    if(!data.length) return;

    let connection = mysql.createConnection(config);

    let query =`INSERT INTO price (brand, art, description, seller, price, link, origin_art) VALUES ?`;

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    connection.query(query, [data], function (error, results, fields) {
        console.log(results);
        console.log(error);
        if (error) throw error;
        return results.rowCount;
    });

    connection.end();
};