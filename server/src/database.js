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
    };
    db.data.pluginSettings ||= [];
};

export default db;