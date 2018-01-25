const Base = require('./base');
const User = require('./user');

module.exports = class Member extends Base {
  constructor(client, member) {
    super(client, member);

    this.user = new User(this.client, member.user);
    this._dm = null;
  }

  get guild() {
    return this.client.guilds.get(this.guildId);
  }

  get _skipFields() {
    return [
      'user',
      // PRESENCE_UPDATE fields
      'game',
      'status'
    ];
  }

  get _optionalFields() {
    return ['nick', 'roles', 'mute', 'deaf', 'joined_at'];
  }
};
