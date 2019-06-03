// Download the helper library from https://jp.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = '**********';
const authToken = '**********';
const client = require('twilio')(accountSid, authToken);

// url : 'https://demo.twilio.com/docs/voice.xml' だったものを書き換え
client.calls
    .create({
        url: 'http://***.***.***.***:1337/',
        to: '+81********',
        from: '+1**********'
    })
    .then(call => console.log(call.sid));