"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
class DatabaseConfig {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    static getInstance() {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig();
        }
        return DatabaseConfig.instance;
    }
    getClient() {
        return this.supabase;
    }
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('id')
                .limit(1);
            if (error) {
                console.error('Database connection test failed:', error);
                return false;
            }
            console.log('Database connection successful');
            return true;
        }
        catch (error) {
            console.error('Database connection error:', error);
            return false;
        }
    }
}
exports.db = DatabaseConfig.getInstance().getClient();
exports.default = DatabaseConfig;
//# sourceMappingURL=database.js.map