let yandex = require('./catalogs/yandex');
let config = require('./config.json');

yandex(
    config.yandex.password,
    config.yandex.login,
    config.yandex.shopId
).then( res => {
    console.log(res);
});