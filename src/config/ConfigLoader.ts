import * as path from 'path';
import * as fs from 'fs';

export class ConfigLoader {
    static async loadRaw(rootPath: string): Promise<string> {
        const configPath = path.join(rootPath, 'openapi-config.js');
        if (fs.existsSync(configPath)) {
            try {
                return fs.readFileSync(configPath, 'utf-8');
            } catch (e) {
                console.error('Error reading config file:', e);
            }
        }
        return '';
    }
}
