import * as Components from './components';

/**
 * Sample plugin with UI component replacement
 */

kiwi.plugin('MyPlugin', function(kiwi, log) {
  log.setLevel(2);
  log('Initialising plugin: My Plugin');

  // load components
  Components.run(kiwi);
});
