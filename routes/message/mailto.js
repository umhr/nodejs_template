//var sakuraMail = require('./SendMail').getInstance('sakura');
//sakuraMail.to('info@mztm.jp', 'fromSakura', 'okoko');


var gMail = require('./SendMail').getInstance('gmail');
gMail.to('info@mztm.jp', 'fromGMail', 'okoko');