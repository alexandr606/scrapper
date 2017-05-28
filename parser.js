'use strict';

let config          = require('./config.json');
let LinksService    = require('./services/price.service');
let avtopro         = require('./catalogs/avtopro.prices');


(function () {
    return LinksService.getLinks(function (links) {
        let count = 0;
        return avtopro.parsePrices(config.avto_pro.login, config.avto_pro.password, links).then( result => {
            count++;
            console.log(result, '#'+count);

        }).catch(err => {
            console.log(err);
        })
    });

})();