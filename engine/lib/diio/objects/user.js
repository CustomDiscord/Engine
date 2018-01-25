const Base = require('./base');
const EP = require('../endpoints');

class User extends Base {
  constructor(client, user) {
    super(client, user);

    this._dm = null;
  }

  async openDM(uid) {
    if (this._dm) {
      return this.client.privateChannels.get(this._dm);
    }

    const res = await this.request('post', EP.UserChannels(this._user.id), {
      recepient_id: uid
    });

    console.debug('[DIIO] createDM', res);
    // save user, shouldn't discord event this?
    this._dm = res.id;
    return this.client.privateChannels.get(res.id);
  }

  getMemberFor(guild) {
    const g = this.client.guilds.get(guild);
    return g ? g.members.get(this.id) : null;
  }
}

module.exports = User;
