const { parse } = require('url');

/**
 * Extends default websocket to allow
 * the client to detect and save
 *
 * @private
 * @class WebSocket
 * @extends {window.WebSocket}
 */
class WebSocket extends window.WebSocket {
  constructor(url, protocols, ...args) {
    super(url, protocols, ...args);

    WebSocket.onCreate(this, url, protocols, ...args);
  }
}

WebSocket.onCreate = () => {};

window.WebSocket = WebSocket;
