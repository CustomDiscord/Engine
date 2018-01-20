const ls = (module.exports = window.localStorage);
const setItem = ls.setItem.bind(ls);

ls.setItem = (key, value) => {
  if (ls[key] != value) {
    let mod = {};
    try {
      mod = JSON.parse(ls['CD-LastModified']);
    } catch (ex) {} //ignore exceptions because they suck
    mod[key] = Date.now();
    setItem('CD-LastModified', JSON.stringify(mod));
  }
  setItem(key, value);
};
