const EventEmitter = require('eventemitter3');
const zlib = require('pako');
const path = require('path');
const Promise = require('bluebird');

// discord erlpack loves to fiddle with the global object it seems. so to counter this, we run erlpack in the electron master process, instead of the web renderer process
const erlpack = require('electron').remote.require(
  path.join(__dirname, 'erlpack.js')
);

/**
 * This class is taken directly from DiscordInjections with slight modifications to support the CustomDiscord workflow.
 *
 * @private
 * @class DiscordClient
 * @extends {EventEmitter}
 */
class DiscordClient extends EventEmitter {
  constructor(CD) {
    super();
    this.CD = CD;
  }

  onHandleWSClose(code, data) {
    // reset runtime state
    this._ready = false;
    this._ws = null;

    // fire disconnect event
    this.emit('disconnect');
  }

  async onHandleWSMessage(ev) {
    const message = await this._decompressWSMessage(ev.data);

    if (message.op === 0) {
      this._sequence = message.s;
    }

    this.emit('raw', message);

    switch (message.t) {
      case 'READY':
        this._user = message.d.user;
        this._guilds = message.d.guilds;
        this._notes = message.d.notes;
        this._presences = message.d.presences;
        this._privateChannels = message.d.private_channels;
        this._relationships = message.d.relationships;
        this._sessionID = message.d.session_id;
        this._userGuildSettings = message.d.user_guild_settings;
        this._userSettings = message.d.user_settings;
        this._v = message.d.v;
    }

    return this.emit(message.t, message.d);
  }

  _decompressWSMessage(data) {
    // assume every message ends with 0x00, 0x00, 0xff,0xff (zlib suffix)
    const buff = new Uint8Array(data);
    this._inflator.push(buff, zlib.Z_SYNC_FLUSH);
    return erlpack.unpack(this._inflator.result);
  }

  connect(ws) {
    this._ws = ws;
    this._inflator = new zlib.Inflate({
      chunkSize: 65535,
      flush: zlib.Z_SYNC_FLUSH
    });

    this._ws.addEventListener('close', ev => this.onHandleWSClose(ev));
    this._ws.addEventListener('error', ev => this.onHandleWSClose(ev));
    this._ws.addEventListener('message', ev => this.onHandleWSMessage(ev));
  }

  request(method, url) {
    const headers = {
      Accept: '*/*',
      'Accept-Language': 'en-US;q=0.8',
      DNT: 1,
      Authorization: JSON.parse(this.DI.localStorage['token']),
      'Content-Type': 'application/json; charset=utf-8' // TODO: support multitype
    };

    return window
      .fetch({
        method,
        url,
        headers
      })
      .then(res => {
        if (res.status === 429) {
          return res
            .json()
            .then(json => json.retry_after)
            .then(delay => Promise.delay(delay))
            .then(() => this.request(method, url));
        }
        if (res.status !== 200) {
          throw new Error('vailed to parse response');
        }

        // TODO: support multitype
        return res.json();
      });
  }

  get selectedGuild() {
    return this._guilds.find(
      g => g.id == window.location.pathname.split('/')[2]
    );
  }

  get selectedChannel() {
    const g = this.selectedGuild;
    if (!g) {
      return this._privateChannels.find(
        c => c.id == window.location.pathname.split('/')[3]
      );
    }
    return g.channels.find(c => c.id == window.location.pathname.split('/')[3]);
  }
}

module.exports = DiscordClient;
