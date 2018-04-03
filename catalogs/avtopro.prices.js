'use strict';

let LinksService = require('../services/price.service');

const Nightmare = require('nightmare');
const nightmare = new Nightmare({show: true });

const FIRST_LINK  = 'https://avto.pro/warehouses/77293/.aspx?step=1000&page=1';
const SECOND_LINK = 'https://avto.pro/warehouses/77293/.aspx?step=1000&pk=1!4!NA--&rk=1!20!NzI3OzI0MzAyODswMDAw&page=2';
const THIRD_LINK  = 'https://avto.pro/warehouses/77293/.aspx?step=1000&pk=1!4!NA--&rk=1!20!NzI3OzI0MzAyODswMDAw&page=3';

module.exports.avtoproPriceLinks = async (login, password) => {
    try {
        let linksOne = await nightmare
            .viewport(1400, 500)
            .goto(`https://avto.pro`)
            .wait(1000)
            .click('a[data-target="#log-in-form-container"]')
            .wait('#log-in-form-container > div:nth-child(1) > form > div:nth-child(1) > label > input[type="text"]')
            .type('#log-in-form-container > div:nth-child(1) > form > div:nth-child(1) > label > input[type="text"]', login)
            .type('#log-in-form-container > div:nth-child(1) > form > div:nth-child(2) > label > input[type="password"]', password)
            .click('#log-in-form-container > div:nth-child(1) > form > div.error > button')
            .wait(1000)
            .goto(FIRST_LINK)
            .wait(3000)
            .evaluate(()=> {
                return [...document.querySelectorAll('a.whp-code')]
                    .map( el => [el.href]);
            });

        let linksTwo = await nightmare
            .goto(SECOND_LINK)
            .wait(3000)
            .evaluate(()=> {
                return [...document.querySelectorAll('a.whp-code')]
                    .map( el => [el.href]);
            });

        let linksTree = await nightmare
            .goto(THIRD_LINK)
            .wait(3000)
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
            .viewport(1200, 500)
            .goto(`https://avto.pro`)
            .click('a[data-target="#log-in-form-container"]')
            .wait('#log-in-form-container > div:nth-child(1) > form > div:nth-child(1) > label > input[type="text"]')
            .type('#log-in-form-container > div:nth-child(1) > form > div:nth-child(1) > label > input[type="text"]', login)
            .type('#log-in-form-container > div:nth-child(1) > form > div:nth-child(2) > label > input[type="password"]', password)
            .click('#log-in-form-container > div:nth-child(1) > form > div.error > button')
            .wait(1000)
            .goto('https://avto.pro/zapchasti-DC9001KIT-EMMETEC/')
            .wait(500)
            .click('#site_content > div > div.grid__col.grid__cell.grid__cell--2.grid__cell--grow > div > div > article > div.part_list_heder_block.flex.justify-space-between.align-center > a')
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

            let err = await nightmare.evaluate(() => {
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

                let originArt = await nightmare.evaluate(function getOriginArt() {
                    return document.querySelector('#js-global-vars').getAttribute('data-paramcode');
                });

                let smPrice = await nightmare.evaluate(function getSmPrice() {
                    let grid = document.querySelector('tr[data-sellerid="1145835"]');

                    if(!grid) {
                        return 0;
                    }

                    return grid.querySelector('td:nth-child(5)').getAttribute('data-value');
                });

                if(smPrice) {
                    data.push(await LinksService.saveParsedData(
                        formResults(await nightmare.evaluate( () => {
                            return [...document.querySelectorAll('tr.pl-partinfo')]
                                .map( el => el.innerText);
                        }), links[i].link, originArt, smPrice)
                    ));
                }


            }
        }

        await nightmare.end();

        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

function formResults (data, link, originArt, smPrice) {
    if(!data || !Array.isArray(data) || !data.length) {
        return [];
    }

    return data.map( function (item) {

        let temp = item.split('\t');

        let price = temp[4].replace('ОПТ', '').replace('Б/У', '').replace(/ /g, '').replace(',', '.');

        let res = {
            brand: temp[0],
            art: temp[1],
            description: temp[2],
            price: price,
            seller: temp[5],
            link: link,
            originArt: originArt,
            differ: Number(smPrice) - Number(price)
        };

        return [
            res.brand,
            res.art,
            res.description,
            res.seller,
            res.price,
            res.link,
            res.originArt,
            isNaN(res.differ) ? 0 : res.differ
        ];
    });
};