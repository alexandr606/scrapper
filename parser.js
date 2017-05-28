'use strict';

let config          = require('./config.json');
let LinksService    = require('./services/price.service');
let avtopro         = require('./catalogs/avtopro.prices');


(function () {
    let parts = [0, 500, 1000, 1500, 2000];

    parts.forEach( part => {
        return LinksService.getLinks(part, function (links) {

            return avtopro.parsePrices(links).then( result => {

                result.forEach( item => {
                    LinksService.saveParsedData(item);
                });

            }).catch(err => {
                console.log(err);
            })

        });
    });
})();