'use strict';


let yandex      = require('./catalogs/yandex');
let avtoPro     = require('./catalogs/avto.pro');
let tiu         = require('./catalogs/tiu');
let zzap        = require('./catalogs/zzap');
let avito       = require('./catalogs/avito');
let dbService   = require('./services/db.service');
let config      = require('./config.json');

let process = async function () {

    try {
        let yandexData = await yandex(
            config.yandex.password,
            config.yandex.login,
            config.yandex.shopId
        );

        let avtoProData = await avtoPro(
            config.avto_pro.login,
            config.avto_pro.password
        );

        let tiuData = await tiu(
            config.tiu.login,
            config.tiu.password
        );

        let zzapData = await zzap(
            config.zzap.login,
            config.zzap.password
        );


        let avitoData = await avito(
            config.avito.login,
            config.avito.password
        );

        return [yandexData, avtoProData, tiuData, zzapData, avitoData];
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }

};


async function writeData () {
    let data = await process();

    data.forEach( item => {
        item.shopId = 'sm';
        dbService(item);
    });
}

writeData ();