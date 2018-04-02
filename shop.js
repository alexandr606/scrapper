'use strict';


let yandex      = require('./catalogs/yandex');
let avtoPro     = require('./catalogs/avto.pro');
let tiu         = require('./catalogs/tiu');
let zzap        = require('./catalogs/zzap');
let avito       = require('./catalogs/avito');
let dbService   = require('./services/db.service');
let config      = require('./config.json');
let avtoProRu   = require('./catalogs/avto.pro.ru');

let process = async function () {
    let yandexData      = await yandex(config.yandex);
    let avtoProData     = await avtoPro(config.avto_pro);
    let tiuData         = await tiu(config.tiu);
    let zzapData        = await zzap(config.zzap);
    // let avitoData       = await avito(config.avito);
    let avtoProRuData   = await avtoProRu(config.avtopro_ru);

    return [yandexData, zzapData, avtoProData, avtoProRuData, tiuData];
};


async function writeData () {
    try {
        let data = await process();

        if(data.length > 0) {
            await Promise.all(data.map( item => {
                if(item && Object.keys(item).length > 0) {
                    item.shopId = 'sm';
                    return dbService(item);
                }

                return null;
            }))
        }
    } catch (err) {
        console.log(err);
    }
}

writeData ();