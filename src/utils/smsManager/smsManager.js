require('dotenv').config();

const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('TWILIO_ACCOUNT_SID:', accountSid);
console.log('TWILIO_AUTH_TOKEN:', authToken);

const twilioClient = twilio(accountSid, authToken);

class SmsManager {
  static instance;
  constructor() {
    if (SmsManager.instance) return SmsManager.instance;
    SmsManager.instance = this;
    this.twilioClient = twilioClient;
  }

  async sendSms({ to, body }) {
    try {
      const message = await this.twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
        body,
      });
      console.log('Message SID:', message.sid);
      return message;
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      throw error;
    }
  }
}

module.exports = new SmsManager();

