import fs from 'fs';
import path from "path";
import { promisify } from 'util';

import env from './env.js';
import database from './database.js';

const fsReaddirAsync = promisify(fs.readdir);

class PluginManager {
    constructor() {
        this.plugins = [];
    }

    async loadPlugins() {
        const internalPluginFiles = await fsReaddirAsync('src/plugins');
        const thirdPartyFiles = await fsReaddirAsync(path.join(env.DATA_PATH, 'plugins')).catch(e => []);

        const internalPlugins = await Promise.all(internalPluginFiles.map(f => import('./' + path.join('plugins', f))));
        const thirdPartyPlugins = await Promise.all(thirdPartyFiles.map(f => import('./' + path.join('plugins', f))));

        this.plugins = []
            .concat(internalPlugins.map(p => p.default))
            .concat(thirdPartyPlugins.map(p => {
                p.default.thirdParty = true;
                return p.default;
            }));

        await Promise.all(this.plugins.map(p => p.onPluginEnabled && p.onPluginEnabled()));
    }

    async handleEvents(events, newData) {
        events.forEach(event => {
            const plugins = this.plugins
                .filter(p => p.configuration.enabled && p.configuration.enabledEvents.includes(event));
            plugins.forEach(p => {
                const configuration = database.data.pluginSettings.find(ps => ps.id === plugin.id) || {};
                p.handleEvent({ event, newData, configuration });
            }); 
        });
    }
}
let _instance;
const PluginManagerSingleton = (() => {
    if (!_instance) {
        _instance = new PluginManager();
    }
    return _instance;
});

export default PluginManagerSingleton;