const accountSid = '**********';
const authToken = '**********';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'test by 水玉製作所',
        from: '+1********',
        to: '+81********'
    })
    .then(message => console.log(message.sid))
    .done();