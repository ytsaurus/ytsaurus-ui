const nodemailer = require('nodemailer');

const fs = require('fs');

if (process.argv.length < 5) {
    console.log(
        'Usage:\n',
        `    ${process.argv[1]} fromAddr toAddr subject messageFile\n`,
    );
    process.exit(1);
}

const from = process.argv[2];
const to = process.argv[3];
const subject = process.argv[4];
const messageFile = process.argv[5];

const transporter = nodemailer.createTransport({
    port: 25,
    host: 'outbound-relay.yandex.net',
    connectionTimeout: 10000,
    socketTimeout: 10000,
});


const content = fs.readFileSync(messageFile);

const options = {
    from,
    to,
    subject,
    text: content,

};

transporter.sendMail(options, (err) => {
    if (err) {
        process.exit(2);
    }
});
