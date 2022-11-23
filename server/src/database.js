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
};

export default db;