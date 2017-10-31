'use strict';

let config          = require('./config.json');
let LinksService    = require('./services/price.service');
let avtopro         = require('./catalogs/avtopro.prices');


(function () {
    return LinksService.getLinks(function (links) {
        let count = 0;
        return avtopro.parsePrices(config.avtopro_ru.login, config.avtopro_ru.password, links).then( result => {
            count++;
            console.log(result, '#'+count);

        }).catch(err => {
            console.log(err);
        })
    });
})();

// (function () {
//     return avtopro.avtoproPriceLinks(config.avtopro_ru.login, config.avtopro_ru.password)
//         .then( function (result) {
//             console.log(result);
//         })
// })();