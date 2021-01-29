# Sample plugin for Kiwi mobile app

This project is a sample plugin for the Kiwi mobile app.

## Creating a plugin

These Kiwi mobile plugins are [NativeScript plugins](https://docs.nativescript.org/plugins/plugin-reference). 
This means that they must follow the [NativeScript plugin requirements](https://docs.nativescript.org/plugins/plugin-reference#create-a-plugin).

Use the [kiwiirc-mobile-plugin-sample](https://github.com/kiwiirc/kiwiirc-mobile-plugin-sample) as a starting point.

1. Download the repo as a [.zip file](https://github.com/kiwiirc/kiwiirc-mobile-plugin-sample/archive/master.zip);

2. Change the name of the package in `src/package.json` (e.g. `my-kiwi-plugin`);

3. Install the plugin
  As you can see in the [docs](https://docs.nativescript.org/plugins/plugin-reference#install-a-plugin), you can install plugins from:

  - Npm registry. See more about publishing to npm [here](https://github.com/NativeScript/nativescript-plugin-seed).

  - A local path: `ns plugin install /path/to/plugin/src`. Notice that you must point to the
    `src/` directory containing the `package.json`.

  - A local `.tar.gz` of the directory containing the `package.json`: `ns plugin install /path/to/plugin.tar.gz`;

  - A remote `.tar.gz` of the directory containing the `package.json`: `ns plugin install https://example.com/plugin.tar.gz`.


4. `require()` the plugin in the App Project's `app/plugins.js``:
    ```js
    // require npm plugins:
    require('my-kiwi-plugin');
    ```

Inside the main `.js` file (`src/index.js`), you must register a plugin using the 
`kiwi.plugin()` call, such as:

```js
kiwi.plugin('plugin_name', function(kiwi, log) {
    // Plugin code here
});
```

Your plugin function will be called once mobile app has been loaded and ready to start. You can listen for events and use any of the below API in your plugin.

As a very simple example, this plugin will listen for any new networks being created and set the default server address to `irc.freenode.net`:

```js
kiwi.plugin('my_plugin', function(kiwi) {
    kiwi.on('network.new', function(event) {
        event.network.connection.server = 'irc.freenode.net';
        event.network.connection.port = 6667;
    });
});
```

# Plugin development
### Using live-sync while developing the plugin

The command `ns plugin install` installs the plugin under `node_modules`, which could make
the development very hard. The best way to develop Kiwi mobile plugins is to install them
from a local directory and use `yarn link` to link the directory under `node_modules` to your
source code.

```bash
cd /path/to/kiwiirc-mobile/mobile
tns plugin install /path/to/my-plugin/src

cd /path/to/my-plugin/src
yarn link

cd /path/to/kiwiirc-mobile/mobile
yarn link my-plugin
```

This way, you can keep developing the plugin in its place
(`/path/to/my-plugin/src`) and each time you change the code, webpack will
re-pack it and the app will reload.

## API

The plugin API is described [here](https://github.com/kiwiirc/kiwiirc-mobile/blob/master/docs/plugins.md)
