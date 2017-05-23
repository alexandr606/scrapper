'use strict';

let config          = require('./config.json');
let LinksService    = require('./services/price.service');
let avtopro         = require('./catalogs/avtopro.prices');


let process = async () => {
    let parts = [0, 500, 1000, 1500, 2000];

    parts.forEach( part => {
        LinksService.getLinks(part, async function (result) {
            let res = result.map( i => i.link );
            await avtopro.parsePrices(res);
        });
    })

};

process();