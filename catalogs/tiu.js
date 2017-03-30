const Nightmare = require('nightmare');
const nightmare = new Nightmare({ show: true });

let tiu = async () => {
    try {
        await nightmare
            .goto(`https://my.tiu.ru/cabinet/order_v2`)
            .wait('#phone_email')
            .type('#phone_email', 'price@avto.ms')
            .type('#password', '1501902013TAT')
            .click('#submit_login_button')
            .wait(1000)
            .goto(`https://my.tiu.ru/cabinet/order_v2#All`)
            .wait(10000)
            .evaluate(() => {
                let table = document.querySelectorAll('.b-orders__table tbody .b-orders__table-row')
                return table;
            })
            .end()

    } catch (err) {
        console.error(err)
    }
}

tiu()