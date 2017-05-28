'use strict';

let config          = require('./config.json');
let LinksService    = require('./services/price.service');
let avtopro         = require('./catalogs/avtopro.prices');


(function () {
    return LinksService.getLinks(function (links) {

        return avtopro.parsePrices(links).then( result => {

            return result.forEach( item => {
                LinksService.saveParsedData(item);
            });

        }).catch(err => {
            console.log(err);
        })

    });

})();