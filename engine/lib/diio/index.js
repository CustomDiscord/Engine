const EventEmitter = require('eventemitter3');
const zlib = require('pako');
const path = require('path');
const Promise = require('bluebird');

const Collection = require('./collection');
const User = require('./objects/user');
const Member = require('./objects/member');

const EP = require('./endpoints');
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

    this.users = new Collection(this, User, {
      onNotFound: id => {
        const g = this.guilds.find(g => g.members.has(id));
        if (g) {
          const m = g.members.get(id);
          return m ? m.user : null;
        }
      }
    });
    this.privateChannels = new Collection(this, require('./objects/channel'));
    this.guilds = new Collection(this, require('./objects/guild'));
    this.channels = new Collection(this, require('./objects/channel'), {
      onNotFound: id => {
        const g = this.guilds.find(g => g.channels.has(id));
        if (g) return g.channels.get(id);
      }
    });
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

    console.time(`[DIIO] handling event <${message.t}>`);
    try {
      switch (message.t) {
        case 'READY':
          this.user = new User(this, message.d.user);
          this.users.clear();
          this.users.add(this.user);

          this.guilds.clear();
          this.guilds.addArray(message.d.guilds);

          this.privateChannels.clear();
          this.privateChannels.addArray(message.d.private_channels);

          this.channels.clear();

          this.users.addArray(
            message.d.presences.map(p =>
              Object.assign(p.user, {
                status: p.status,
                game: p.game,
                last_modifed: p.last_modifed
              })
            )
          );
          this.users.addArray(
            message.d.relationships.map(r =>
              Object.assign(r.user, { relationship: r.type })
            )
          );
          this._notes = message.d.notes;
          this._sessionID = message.d.session_id;
          this._userGuildSettings = message.d.user_guild_settings;
          this._userSettings = message.d.user_settings;
          this._v = message.d.v;
          break;

        case 'GUILD_SYNC':
          const g = this.guilds.get(message.d.id);
          if (!g) {
            throw new Error('requested unknown guild');
          }
          g.members.addArray(message.d.members);
          this.users.addArray(
            message.d.presences.map(p =>
              Object.assign(p.user, {
                status: p.status,
                game: p.game,
                last_modifed: p.last_modifed
              })
            )
          );
          break;

        case 'PRESENCE_UPDATE':
          // lags out everything, horribly!
          // implement non-lagging method (web-workers?)
          break;

        case 'GUILD_MEMBER_ADD':
          {
            let u = this.users.get(message.d.user.id);
            if (!u) {
              if (!message.d.user.username) {
                throw new Error('GUILD_MEMBER_ADD: requested unknown user!');
              } else {
                u = new User(this, message.d.user);
                this.users.add(u);
              }
            }

            if (message.d.guild_id) {
              let m = u.getMemberFor(message.d.guild_id);
              if (!m) {
                if (!u) {
                  throw new Error(
                    'GUILD_MEMBER_ADD: requested unknown member!'
                  );
                }
                m = new Member(this, message.d);
                this.guilds.get(message.d.guild_id).members.add(m);
              }
              m.merge(message.d);
            }
          }
          break;

        case 'GUILD_MEMBER_UPDATE':
          {
            let u = this.users.get(message.d.user.id);
            if (!u) {
              if (!message.d.user.username) {
                throw new Error('GUILD_MEMBER_UPDATE: requested unknown user!');
              } else {
                u = new User(this, message.d.user);
                this.users.add(u);
              }
            }
            const m = u.getMemberFor(message.d.guild_id);
            if (!m) {
              const g = this.guilds.get(message.d.guild_id);
              g.members.add(new Member(this, message.d));
            } else {
              m.merge(message.d);
            }
          }
          break;

        case 'GUILD_MEMBER_REMOVE':
          {
            let u = this.users.get(message.d.user.id);
            if (!u) {
              if (!message.d.user.username) {
                throw new Error('GUILD_MEMBER_REMOVE: requested unknown user!');
              } else {
                u = new User(this, message.d.user);
                this.users.add(u);
              }
            }
            const m = u.getMemberFor(message.d.guild_id);
            if (m) {
              m.guild.members.delete(m.id);
            }
          }
          break;

        case 'MESSAGE_CREATE':
        case 'MESSAGE_UPDATE':
        case 'MESSAGE_DELETE':
        case 'MESSAGE_REACTION_ADD':
        case 'MESSAGE_REACTION_REMOVE':
          // message cache? maybe? dont know if we want this.
          break;

        case null:
        case 'MESSAGE_ACK':
        case 'RESUMED':
        case 'TYPING_START':
          // ignored events, uninterested in these.
          break;

        default:
          console.debug('[DDIO] unhandled event', message.t, message.d);
      }
    } catch (ex) {
      console.error(
        '[DIIO] exception in event handler:',
        message.t,
        message.d,
        ex
      );
    }
    console.timeEnd(`[DIIO] handling event<${message.t}>`);
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

  async request(method, url, data) {
    const headers = {
      Accept: '*/*',
      'Accept-Language': 'en-US;q=0.8',
      DNT: 1,
      Authorization: JSON.parse(this.CD.localStorage['token']),
      'Content-Type': 'application/json; charset=utf-8' // TODO: support multitype
    };

    if (data) {
      try {
        data = JSON.stringify(data);
      } catch (ex) {}
    }

    const body = method !== 'get' ? data : '';
    const resut = await window.fetch(url, {
      method,
      body,
      headers,
      redirect: 'follow'
    });
    // bois we got ratelimited!
    if (result.status === 429) {
      return result
        .json()
        .then(json => json.retry_after)
        .then(delay => Promise.delay(delay))
        .then(() => this.request(method, url, data));
    }

    if (((result.status / 100) | 0) !== 2) {
      throw new Error('failed to parse response');
    }

    return result.json();
  }

  get selectedGuild() {
    return this.guilds.find(
      g => g.id == window.location.pathname.split('/')[2]
    );
  }

  get selectedChannel() {
    const g = this.selectedGuild;
    if (!g) {
      return this.privateChannels.find(
        c => c.id == window.location.pathname.split('/')[3]
      );
    }
    return g.channels.find(c => c.id == window.location.pathname.split('/')[3]);
  }

  async resolveID(id) {
    if (typeof id !== 'string') {
      if (!id.id) {
        throw new Error('id unresolvable');
      }

      id = id.id;
    }

    // search through private channels
    if (this.privateChannels.has(id)) {
      return id;
    }

    if (this.privateGroupChannels.has(id)) {
      return id;
    }

    let target = this._privateChannels.find(c => c.id === id);
    if (target) {
      if (target.recipients.length > 1) {
        this.privateGroupChannels.set(id, target);
      } else {
        this.privateChannels.set(id, target);
      }

      return target.id;
    }

    // search through users
    if (this.users.has(id) && this.users.get(id).dm) {
      return this.users.get(id).dm;
    }

    // - existing private channels
    target = this._privateChannels.find(
      c => c.recipients.length === 1 && c.recipients[0].id === id
    );
    if (target) {
      this.privateChannels.set(target.id, target);
      this.users.set(id, target.recipients[0]);
      this.users.get(id).dm = target.id;

      return target.id;
    }

    // - user object without a dm
    if (this.users.has(id)) {
      return this.openDMChannel(id).id;
    }

    // check if we got a matching channel
    if (this.channels.has(id)) {
      return id;
    }

    // this kept throwing errors about using map on undefined
    target = this._guilds.find(g => {
      const channels = g.channels.find(c => c.id === id);
      if (channels) {
        channels.guild_id = g.id;
        return channels;
      }
      return false;
    });

    if (target) {
      this.channels.set(id, target);
      if (!this.guilds.has(target.guild_id)) {
        this.guilds.set(
          target.guild_id,
          this._guilds.find(g => g.id === target.guild_id)
        );
      }
      return target.id;
    } else {
      return new Error('could not resolve id');
    }
  }
}

module.exports = DiscordClient;
