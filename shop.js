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
            config.avto_pro.password,
            'avtopro'
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

        let avtoProRuData = await avtoPro(
            config.avtopro_ru.login,
            config.avtopro_ru.password,
            'avtopro_ru'
        );

        return [yandexData, avtoProData, tiuData, zzapData, avitoData, avtoProRuData];
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }

};


async function writeData () {

    try {
        let data = await process();

        for(let i=0; i< data.length; i++) {
            if(data[i] && Object.keys(data[i]).length > 0) {
                data[i].shopId = 'sm';
                await dbService(data[i]);
            }
        }
    } catch (err) {
        console.log(err);
    }

}

writeData ();