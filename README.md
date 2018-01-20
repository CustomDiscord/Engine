# CustomDiscord

Custom Discord is a Discord Client modification that allows you to inject custom CSS and Javascript right into the discord client.

[![Discord](https://img.shields.io/discord/396365477942657030.svg?style=for-the-badge&label=Discord&logo=discord)](https://discord.gg/MkQ6Cpw)

## Getting Started

**TODO:** _Better_ Instructions

1. Install `npm` or `yarn`.
2. `git clone` the repo.
3. `npm i` or `yarn install` the dependencies.

Currently, you will have to set the file manually.
You need to find your discord installation directory

It should be located here:
Linux `/usr/opt/discord-canary/resources/app`
Windows `%localappdata%\discordcanary\resources\app`
OSX `?`

the `app` directory will most likely not exist so you will have to create it. Inside that directory you will need to put two files

package.json

```json
{
  "name": "customdiscord-loader",
  "version": "0.1.0",
  "description": "Advanced Discord client injection mod",
  "main": "index.js",
  "scripts": {},
  "author": "Nightmare",
  "license": "MIT",
  "dependencies": {},
  "private": true
}
```

index.js

```js
require('/path/to/CustomDiscord/index.js').inject(__dirname);
```

## Credits

Heavily influenced by [Discord Injections v4](https://github.com/DiscordInjections/DiscordInjections/tree/v4)
