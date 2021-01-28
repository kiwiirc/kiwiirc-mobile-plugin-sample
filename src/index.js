import Avatar from './components/Avatar';
import HelloMessage from './components/HelloMessage';

/**
 * Sample plugin with UI component replacement
 */
kiwi.plugin('MyPlugin', function(kiwi, log) {
  log.setLevel(2);
  log('Initialising plugin: My Plugin');

  // Replace Avatar with custom component
  kiwi.replaceModule('mobile/components/Avatar', Avatar);


  // Add component above the input
  kiwi.addUi(
    'input_top',  // or 'input_tool', 'browser'
      HelloMessage, // component
      { state: kiwi.state, log } // props
  );

  // Adding translations
  kiwi.i18n.addResourceBundle('en-us', 'translation', require('./assets/locales/en-us.json'));
  kiwi.i18n.addResourceBundle('es-es', 'translation', require('./assets/locales/es-es.json'));
  kiwi.i18n.addResourceBundle('fr-fr', 'translation', require('./assets/locales/fr-fr.json'));
  kiwi.i18n.addResourceBundle('pt-pt', 'translation', require('./assets/locales/pt-pt.json'));
});
