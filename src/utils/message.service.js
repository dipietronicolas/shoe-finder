const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const myPhoneNumber = process.env.MY_CELLPHONE_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken);

const sendMessage = (message = '') => {
    client.messages
        .create({
            from: `whatsapp:${twilioPhoneNumber}`,
            body: message,
            to: `whatsapp:${myPhoneNumber}`
        })
        .then(message => console.log(message))
        .catch(error => console.error(error));
}

const sendMessageWithMedia = (elements = []) => {
    elements.map((shoe) => {
        client.messages
            .create({
                mediaUrl: shoe.imageUrl,
                from: `whatsapp:${twilioPhoneNumber}`,
                body: `${shoe.title} - ${shoe.link}`,
                to: `whatsapp:${myPhoneNumber}`
            })
            .then(message => console.log(message))
            .catch(error => console.error(error));
    })
}


module.exports = {
    sendMessage,
    sendMessageWithMedia
};


