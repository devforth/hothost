import fs from 'fs';
import path from "path";
import { promisify } from 'util';

import env from './env.js';
import database from './database.js';

const fsReaddirAsync = promisify(fs.readdir);

class PluginManager {
    constructor() {
        this.plugins = [];
        this.rssQueue = [];
        this.rssSendInterval = setInterval(() => this.processRssQueue(), 1000);
    }

    async loadPlugins() {
        const internalPluginFiles = await fsReaddirAsync('src/plugins');
        const thirdPartyFiles = await fsReaddirAsync(path.join(env.DATA_PATH, 'plugins')).catch(e => []);

        const internalPlugins = await Promise.all(
            internalPluginFiles.filter(
                (f) => !f.endsWith('.src')
            ).map(f => import('./' + path.join('plugins', f)))
        );

        const thirdPartyPlugins = await Promise.all(thirdPartyFiles.map(f => import('./' + path.join('plugins', f))));

        this.plugins = []
            .concat(internalPlugins.map(p => p.default))
            .concat(thirdPartyPlugins.map(p => {
                p.default.thirdParty = true;
                return p.default;
            }));
        await Promise.all(this.plugins
            .filter(p => {
                return database.data.pluginSettings.find(ps => ps.id === p.id)?.enabled ?? false
            })
            .map(p => p.onPluginEnabled && p.onPluginEnabled())
        );
    }

    async handleEvents(events, newData) {
        let hostEvents = []
      
        if (newData.enabledNotifList) { 
            const eventsList = Object.values(newData.enabledNotifList).filter(e=>!e.value).map(e=>e.events).flat()
            hostEvents=[...eventsList]
        }
       
        for ( let eventType of events) {
            const plugins = this.plugins
                .map(p => {
                    const settings = database.data.pluginSettings.find(ps => ps.id === p.id) || {};
                    return {
                        plugin: p,
                        settings,
                    }
                })
            
                .filter(p => p.settings.enabled && p.settings.enabledEvents.includes(eventType) 
                && !hostEvents.includes(eventType));
                
            
            // handle event by all plugins in parallel
            await Promise.all(
                plugins.map( 
                    async (p) => {
                        try {
                            await p.plugin.handleEvent({ eventType, data: newData, settings: p.settings });
                        } catch (e) {
                            console.error('Error in plugin', p.id, e, 'stack:', e.stack)
                        }
                    }
                )
            );
       
                
        }
    }

    async processRssQueue() {
        if (this.rssQueue.length) {
            const rssFotmedMessage = this.rssQueue.unshift();
            // plugins var is only enabled plugin for this event 
            await Promise.all(
                plugins.map( 
                    async (p) => {
                        try {
                            await p.plugin.sendMessage(p.settings, rssFotmedMessage);
                        } catch (e) {
                            console.error('Error in plugin', p.id, e, 'stack:', e.stack)
                        }
                    }
                )
            );
        }
    }

    async handleRssEvent(text) {
        this.rssQueue.push(text)
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