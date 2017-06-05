'use strict';

let LinksService = require('../services/price.service');

const Nightmare = require('nightmare');
const nightmare = new Nightmare({show: true });


module.exports.avtoproPriceLinks = async (login, password) => {
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

module.exports.parsePrices = async (login, password, links) => {
    try {

        let data = [];

        await nightmare
            .viewport(1000, 500)
            .goto(`https://avto.pro`)
            .click('a[data-target="#log-in-form-container"')
            .wait('input[name="login"]')
            .type('input[name="login"]', login)
            .type('input[name="password"]', password)
            .click('button[type="submit"]')
            .wait(1000)
            .goto('https://avto.pro/zapchasti-BW002R-BOSCH/')
            .wait(500)
            .click('a[href="#js-modal-preferences"]')
            .select('#js-form-preferences > div.clearfix > div:nth-child(2) > select', 'UAH')
            .wait(500)
            .click('#js-preferences-globe')
            .wait(500)
            .click('a[data-city="Харьков"')
            .wait(500)
            .click('#js-form-preferences > button')
            .wait(3000);

        for(let i=0; i < links.length; i++) {

            await nightmare.goto(links[i].link)
                .wait(500);

            let err = await nightmare.evaluate( () => {
                return document.querySelector('#txt-global > div.er_name');
            });

            if(!err) {
                let btn = await nightmare.exists('#js-btn-partslist-primary-showmore');

                if(btn) {
                    await nightmare.click('#js-btn-partslist-primary-showmore')
                        .wait(function () {
                            return (document.querySelector('#js-btn-partslist-primary-showmore') === null)
                        })
                }

                let originArt = await nightmare.evaluate( () => {
                    return document.querySelector('#js-global-vars').getAttribute('data-paramcode');
                });

                data.push(await LinksService.saveParsedData(
                    formResults(await nightmare.evaluate( () => {
                        return [...document.querySelectorAll('tr.pl-partinfo')]
                            .map( el => el.innerText);
                    }), links[i].link, originArt)
                ));
            }
        }

        await nightmare.end();

        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

function formResults (data, link, originArt) {
    if(!data || !Array.isArray(data) || !data.length) {
        return [];
    }

    return data.map( function (item) {

        let temp = item.split('\t');

        let res = {
            brand: temp[0],
            art: temp[1],
            description: temp[2],
            price: temp[4].replace('ОПТ', '').replace('Б/У', '').replace(/ /g, '').replace(',', '.'),
            seller: temp[5],
            link: link,
            originArt: originArt
        };

        return [res.brand, res.art, res.description, res.seller, res.price, res.link, res.originArt];
    });

}