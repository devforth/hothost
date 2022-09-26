import { Level } from 'level';
import path from 'path';
import env from './env.js';

const filePath = path.join(env.DATA_PATH, 'process');

const database = new Level(filePath, { valueEncoding: 'json' });

export default database;