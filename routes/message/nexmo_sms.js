const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: '********',
    apiSecret: '********'
})

const from = 'Mizutama Inc.'
const to = '********'
const text = 'Hello World from http://mztm.jp'

nexmo.message.sendSms(from, to, text)