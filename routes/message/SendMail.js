exports.getInstance = function (bland) {
    return new SendMail(bland);
};

var SendMail = function (bland) {
    this._from;
    this._transport;
    this._constructor(bland);
}

SendMail.prototype._constructor = function (bland) {
    var smtpConfig;
    if (bland == 'sakura') {
        this._from = 'umehara@mztm.jp';
        smtpConfig = {
            host: '****.sakura.ne.jp',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: '********',
                pass: '********'
            }
        };
    } else if (bland == 'gmail') {
        this._from = '****@gmail.com';
        smtpConfig = {
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: '****',
                pass: '********'
            }
        };
    }
    if (smtpConfig == undefined) {
        return;
    }
    this._transport = require("nodemailer").createTransport(require("nodemailer-smtp-transport")(smtpConfig));
}

SendMail.prototype.to = function (address, subject, text) {
    var mailOptions = {
        from: this._from,
        to: address,
        subject: subject,
        text: text
    };
    this._transport.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("Message sent: " + response.message);
        }
        this._transport.close();
    });
}