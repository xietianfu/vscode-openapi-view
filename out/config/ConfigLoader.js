"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const path = require("path");
const fs = require("fs");
class ConfigLoader {
    static loadRaw(rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const configPath = path.join(rootPath, 'openapi-config.js');
            if (fs.existsSync(configPath)) {
                try {
                    return fs.readFileSync(configPath, 'utf-8');
                }
                catch (e) {
                    console.error('Error reading config file:', e);
                }
            }
            return '';
        });
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=ConfigLoader.js.map