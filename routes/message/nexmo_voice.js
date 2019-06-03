const Nexmo = require('nexmo');

const nexmo = new Nexmo({
    apiKey: '******',
    apiSecret: '********',
    applicationId: '****-****-****-****-****',
    privateKey: './private.key',
});

const ncco = [{
    action: 'talk',
    voiceName: 'Salli',
    text: 'This is a Mizutama desuyo',
}, ];

nexmo.calls.create({
        to: [{
            type: 'phone',
            number: '********'
        }],
        from: {
            type: 'phone',
            number: '********'
        },
        ncco,
    },
    (err, result) => {
        console.log(err || result);
    },
);