const Plugin = module.parent.require('../components/plugin');
const semver = require('semver');
const changelogData = require('../../../changelog');

class changelog extends Plugin {
  preload() {
    this.registerCommand({
      name: 'changelog',
      info: 'Display the CustomDiscord changelog',
      func: this.displayChangelog.bind(this)
    });
  }

  load() {
    const lastChangelog = this.getSettingsNode('lastChangelog', 0);
    if ((lastChangelog == 0 || semver.lt(lastChangelog), this.CD.version)) {
      this.displayChangelog();
      this.setSettingsNode('lastChangelog', this.CD.version);
    }
  }

  displayChangelog() {
    let output = [];
    let keys = Object.keys(changelogData).slice(0, 5);
    for (const version of keys) {
      output.push(
        `<h1 class='added-3Q7OGu title-1PW5Fd marginTop-4_cfcL marginTop20-3UscxH'${
          version !== this.CD.version
            ? ''
            : "style='margin-top: 0px !important'"
        }>Version ${version}</h1>`
      );
      for (const key in changelogData[version]) {
        output.push(`
          <h5 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl marginTop20-3UscxH weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q">
            ${key}
          </h5>`);
        const changes = changelogData[version][key];
        if (Array.isArray(changes)) {
          output.push(
            `<ul>${changelogData[version][key]
              .map(k => `<li>${k}</li>`)
              .join('\n')}</ul>`
          );
        } else {
          output.push(`<p>${changes}</p>`);
        }
      }
    }

    this.CD.plugins.get('react')
      .createModal(`<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE">
      <div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
          <h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">
              Custom Discord Changelog
          </h4>
          <div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn">Current Version: ${
            this.CD.version
          }</div>
      </div>
      <svg class="close-3ejNTg flexChild-1KGW5q CD-modal-close-button" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
  </div>
  <div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
      <div class="scroller-fzNley inner-tqJwAU content-3KEfmo">
      ${output.join('\n')}
  </div></div>
  `);
  }
}

module.exports = changelog;
