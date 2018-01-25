const Base = require('./base');
const EP = require('../endpoints');

class Channel extends Base {
  constructor(client, channel) {
    super(client, channel);
  }

  send(message, embed) {
    if (typeof message !== 'string') {
      embed = message;
      message = null;
    }

    const msg = {
      content: message,
      nonce: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      embed
    };

    return this.client.request('post', EP.Messages(this.id), msg);
  }
}

module.expors = Channel;
