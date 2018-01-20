/**
 * Abstract class that defines a Command.
 *
 * @author Nightmare
 * @since 0.1.0
 * @version 0.1.0
 * @class Command
 */
class Command {
  constructor(plugin, options = {}) {
    this.plugin = plugin;
    if (options.name) this.name = options.name;
    else throw new Error('Cannot instantiate a command without a name!');
    this.info = options.info || 'A super cool command.';
    this.usage = options.usage || '';
    this.usage = this.usage.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (options.func) this.execOverride = options.func;
  }

  get header() {
    if (this.plugin) return this.plugin._name;
    else return '';
  }

  _execute(args) {
    if (this.execOverride) return this.execOverride(args);
    else return this.execute(args);
  }
  /**
   * Called upon command execution with provided args
   *
   * @argument {string[]} args Arguments provided by the user
   * @memberof Command
   */
  execute(args) {}
}

module.exports = Command;
