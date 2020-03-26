# Sample plugin for Kiwi mobile app

This project is a sample plugin for the Kiwi mobile app.

# Plugin system

The Kiwi mobile app has a plugin system, similar to the [Kiwi web app plugin system](https://github.com/kiwiirc/kiwiirc/wiki/Plugins).

## Plugin installation

You can install Kiwi app mobile plugins like any other NativeScript plugin, i.e. with `tns plugin install <plugin>`. See the command documentation [here](https://docs.nativescript.org/tooling/docs-cli/lib-management/plugin-install).

As you can see in the [docs](https://docs.nativescript.org/plugins/plugin-reference#install-a-plugin), you can install plugins from:

- Npm registry. See more about publishing to npm [here](https://github.com/NativeScript/nativescript-plugin-seed).

- A local path: `tns plugin install /path/to/plugin/src`. Notice that you must point to the
  `src/` directory containing the `package.json`.

- A local `.tar.gz` of the directory containing the `package.json`: `tns plugin install /path/to/plugin.tar.gz`;

- A remote `.tar.gz` of the directory containing the `package.json`: `tns plugin install https://example.com/plugin.tar.gz`.

# Plugin development

## Creating a Kiwi mobile app plugin

Kiwi mobile plugins are [NativeScript plugins](https://docs.nativescript.org/plugins/plugin-reference).
This means that they must follow the [NativeScript plugin requirements](https://docs.nativescript.org/plugins/plugin-reference#create-a-plugin). Additionally, Kiwi plugins names MUST start with
`ns-kiwi-plugin-`, e.g. `ns-kiwi-plugin-sample`.

You can see the [sample plugin here](https://github.com/kiwiirc/ns-kiwi-plugin-sample).

1. Start by cloning the sample plugin:

```bash
git clone https://github.com/kiwiirc/ns-kiwi-plugin-sample ns-kiwi-plugin-my-plugin
cd ns-kiwi-plugin-my-plugin
rm -rf .git
```

2. Change the name of the package in `src/package.json` to your plugin name (e.g. `ns-kiwi-plugin-my-plugin`).

### Using live-sync while developing the plugin

The command `tns plugin install` installs the plugin under `node_modules`, which could make
the development very hard. The best way to develop Kiwi mobile plugins is to install them
from a local directory and use `yarn link` to link the directory under `node_modules` to your
source code.

```bash
cd /path/to/kiwiirc-mobile/mobile
tns plugin install /path/to/ns-kiwi-plugin-my-plugin/src

cd /path/to/ns-kiwi-plugin-my-plugin/src
yarn link

cd /path/to/kiwiirc-mobile/mobile
yarn link ns-kiwi-plugin-my-plugin
```

This way, you can keep developing the plugin in its place
(`/path/to/ns-kiwi-plugin-my-plugin/src`) and each time you change the code, webpack will
re-pack it and the app will reload.

## Plugin initialization

The plugin source directory must include an `index.js` file. This file will be the entry point of the plugin, responsible for its initialization. A plugin can be initialized in two ways:

- Export an `init()` function:

  ```js
  export function init(kiwi, log) {
    // sets log level
    log.setLevel(2);
    log('Initialising plugin: MyPlugin');

    // adds a startup method
    kiwi.addStartup('MyPluginStartup', startup);
  }
  ```

- Execute `kiwi.plugin(<plugin name>, <init function>)`:
  ```js
  // `kiwi` is globally available
  kiwi.plugin('samplePlugin', function(kiwi, log) {
    log.setLevel(2);
    log('Initialising plugin: Sample Plugin');
  });
  ```

## Plugin assets and resources

Plugins can include:

- Code (`.js` and `.vue`). See [Extending the app code](#extending-the-app-code).

- An `assets` directory. The contents of this directory will be copied to a `plugins/<plugin name>` directory inside the final bundle.

  For instance, the file `ns-kiwi-plugin-my-plugin/src/assets/images/my_img.jpg` can be accessed from the code with `background: url('~/plugins/ns-kiwi-plugin-my-plugin/images/my_img.png')'`.

- A `platforms` directory. This directory holds resource files similar to the `mobile/app/App_Resources` directory. Check the [sample plugin project](https://github.com/kiwiirc/ns-kiwi-plugin-sample) to see the expected folder structure. This directory is used for image resources (see how to use them [here](https://docs.nativescript.org/ui/image-resources)). These can be accessed for example with `background: url('res://my_img')'`.

## Extending the app code

The `kiwi` object in the plugin initialization function is the `GlobalApi` (`mobile/app/libs/GlobalApi.js`) object. We can use it to access and change the app's functionality.

### Module replacement

You can replace any app module (either `.js` or `.vue` files) with:

```js
import ControlInput from './ControlInput'; // this is a .vue file

export function run(kiwi) {
  // Replace every instance of the ControlInput with our own component
  kiwi.replaceModule('mobile/components/ControlInput', ControlInput);
}
```

### Adding a startup

You can add a startup method with `kiwi.addStartup(<startup name>, <startup>);`, e.g.:

```js
import MyStartup from './startup';

//...
const startup = new MyStartup();
kiwi.addStartup('MyStartup', startup);
```

The startup class should look like this:

```js
export default class MyStartup {
    /**
     * Startup function.
     * @param {Object} vueInstance Instance of the Vue component calling this function.
     * @returns {Promise} If resolved, the app will continue the main Page.
     */
    startup(vueInstance) {
        return new Promise((resolve, reject) => {
            // Navigatins to a Login Page, for instance.
            vueInstance.$navigateTo(MyLoginPage, { });

            // at some point `ircClientConnect()` should be called, then
            resolve('done');
            // then the app will continue to the main Page.

            // or
            reject('because reasons');
            // App will display the error
        });
    }

    /**
     * (optional) Function called on logout.
     * @returns {Promise} If resolved, the app will continue the login. If rejected, the logout process will be aborted and the App will return to the main page.
     */
    logout() { }
```

Remember to set the startup in `mobile/app/assets/config.json`:

```json
"startupScreen": "MyStartup"
```

## Plugin themes

1. Create the `.css` theme file in the `assets` folder, e.g. `ns-kiwi-plugin-my-plugin/src/assets/themes/my_theme.css`.

   The css should contain the theme palette. You can also add other custom classes. See the sample theme [here](https://github.com/kiwiirc/ns-kiwi-plugin-sample/blob/master/src/assets/themes/sample-theme.css).

2. Set the theme in `mobile/app/assets/config.json`:

   ```json
       "theme": "My Theme",
       "themes": [
           {
               "name": "My Theme",
               "url": "plugins/ns-kiwi-plugin-my-plugin/themes/my_theme.css"
           },
   ```
