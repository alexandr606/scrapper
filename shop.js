let yandex  = require('./catalogs/yandex');
let avtoPro = require('./catalogs/avto.pro');

let config = require('./config.json');

// yandex(
//     config.yandex.password,
//     config.yandex.login,
//     config.yandex.shopId
// ).then( res => {
//     console.log(res);
// });

avtoPro(
    config.avto_pro.login,
    config.avto_pro.password
).then( res => {
    console.log(res);
});