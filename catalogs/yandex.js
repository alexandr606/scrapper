const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });

let yandex = async (password, login, shopId) => {
    try {
        let cost = await nightmare
            .goto(`https://partner.market.yandex.ru/order.xml?id=${shopId}`)
            .type('input[name="login"]', login)
            .type('input[name="passwd"]', password)
            .click('.domik-submit-button')
            .wait('.order-report-last')
            .evaluate(() => {
                let balance = document.querySelector('.order-report-last div strong').innerText;
                let data = [...document.querySelectorAll('.statistic-tab_content table tbody tr ')]
                    .map( el => el.innerText);

                let cost = data[data.length-3].split('\t')[2];
                let clicks = data[0].split('\t')[2];
                return { balance, cost, clicks };
            });

        let orders = await nightmare
            .goto(`https://partner.market.yandex.ru/orders-list.xml?id=${shopId}`)
            .wait('.orders__body')
            .evaluate(() => {
                return [...document.querySelectorAll('div.order-price')]
                    .map( el => el.innerText.split(' ')[0]);
            });

        await nightmare.end();

        return { cost ,orders };
    } catch (err) {
        console.error(err);
    }
};

module.exports = yandex;


