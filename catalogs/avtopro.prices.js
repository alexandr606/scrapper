'use strict';

let LinksService = require('../services/price.service');

const Nightmare = require('nightmare');
const nightmare = new Nightmare({show: true });


let avtoproPrice = async (login, password) => {
    try {
        let linksOne = await nightmare
            .viewport(1000, 500)
            .goto(`https://avto.pro`)
            .click('a[data-target="#log-in-form-container"')
            .wait('input[name="login"]')
            .type('input[name="login"]', login)
            .type('input[name="password"]', password)
            .click('button[type="submit"]')
            .wait(1000)
            .goto('https://avto.pro/warehouses/23038/.aspx?page=1&step=1000&')
            .evaluate(()=> {
                return [...document.querySelectorAll('a.whp-code')]
                    .map( el => [el.href]);
            });

        let linksTwo = await nightmare
            .goto('https://avto.pro/warehouses/23038/.aspx?step=1000&pk=1!4!NA--&rk=1!24!MTY5MztWVzIxNEM7MDAwMA--&page=2')
            .evaluate(()=> {
                return [...document.querySelectorAll('a.whp-code')]
                    .map( el => [el.href]);
            });

        let linksTree = await nightmare
            .goto('https://avto.pro/warehouses/23038/.aspx?step=1000&pk=1!4!OQ--&rk=1!20!MTY5MztOSTA0MjswMDAw&page=3')
            .evaluate(()=> {
                return [...document.querySelectorAll('a.whp-code')]
                    .map( el => [el.href]);
            });

        await nightmare.end();

        let all = linksOne.concat(linksTwo, linksTree);

        let count = await LinksService.saveLinks(all);

        console.log(count);

        return count;
    } catch (err) {
        console.error(err);
    }
};

module.exports.parsePrices = async (links, login, password) => {
    try {
        let linksOne = await nightmare
            .viewport(1000, 500)
            .goto(`https://avto.pro`)
            .click('a[data-target="#log-in-form-container"')
            .wait('input[name="login"]')
            .type('input[name="login"]', login)
            .type('input[name="password"]', password)
            .click('button[type="submit"]')
            .wait(500);

        let results = await Promise.all(links.map( link => {
            return nightmare.goto(link)
                .wait(500)
                .click('#js-btn-partslist-primary-showmore')
                .wait(3000)
                .evaluate( () => {
                    return [...document.querySelectorAll('tr.pl-partinfo')]
                        .map( el => el.innerText);
                })
        }));

        await nightmare.end();

        return results.map( result => {
            LinksService.saveParsedData(formResults(result));
        });
    } catch (err) {
        console.error(err);
    }

};

function formResults(data) {
    return data.map( item => {
        let temp = item.split('\t');

        let data = {
            brand: temp[0],
            art: temp[1],
            description: temp[2],
            price: temp[4].replace('Б/У', '').replace(' ', '').replace(',', '.'),
            seller: temp[5]
        };

        return [data.brand, data.art, data.description, data.seller, data.price];
    });

}