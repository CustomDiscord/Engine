exports.BaseAPI = 'https://discordapp.com/api';
exports.BaseCDN = 'https://cdn.discordapp.com';
exports.BaseMe = exports.BaseAPI + '/users/@me';

exports.User = uid => `${exports.BaseAPI}/users/${uid}`;
exports.UserChannels = uid => `${exports.BaseAPI}/users/${uid}/channels`;

exports.Channel = cid => `${exports.BaseAPI}/channels/${cid}`;
exports.Messages = (cid, mid = null) =>
  `${exports.Channel(cid)}/messages${mid ? `/${mid}` : ''}`;
