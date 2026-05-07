import path from 'path';
import { JSONFile, Low } from 'lowdb';

import env from './env.js';

const filePath = path.join(env.DATA_PATH, 'hothost.json');
const adapter = new JSONFile(filePath);
const db = new Low(adapter);

const _read = db.read.bind(db);

db.read = async function () {
    await _read();
    if (!db.data) {
        db.data = {};
    }

    db.data.users ||= [];
    db.data.monitoringData ||= [];
    db.data.httpMonitoringData ||= [];
    db.data.settings ||= {
        RAM_THRESHOLD: 90,
        RAM_STABILIZATION_LEVEL: 3,
        DISK_THRESHOLD: 90,
        DISK_STABILIZATION_LEVEL: 1,
        HOST_IS_DOWN_CONFIRMATIONS: 1,
        HTTP_ISSUE_CONFIRMATION: 1,
        DAYS_FOR_SSL_EXPIRED: 14,
        HOURS_FOR_NEXT_ALERT: 12,


    };
    db.data.pluginSettings ||= [];
    db.data.hostGroups ||= [];
    db.data.groupPluginSettings ||= [];

    // Migrate legacy slackSettings/slackWebhook from group objects to groupPluginSettings
    let migrated = false;
    for (const group of db.data.hostGroups) {
        if (group.slackSettings || group.slackWebhook) {
            const alreadyMigrated = db.data.groupPluginSettings.some(
                (s) => s.groupId === group.id && s.pluginId === 'slack-notifications'
            );
            if (!alreadyMigrated) {
                const entry = {
                    groupId: group.id,
                    pluginId: 'slack-notifications',
                    params: group.slackSettings?.params || (group.slackWebhook ? { webhook: group.slackWebhook } : {}),
                };
                // Only set enabledEvents if explicitly configured; omit the property to inherit global settings
                if (group.slackSettings?.enabledEvents) {
                    entry.enabledEvents = group.slackSettings.enabledEvents;
                }
                db.data.groupPluginSettings.push(entry);
            }
            delete group.slackSettings;
            delete group.slackWebhook;
            delete group.channelName;
            migrated = true;
        }
    }
    if (migrated) {
        await db.write();
    }
};

export default db;