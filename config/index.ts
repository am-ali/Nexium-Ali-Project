const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    mongodbUri: process.env.MONGODB_URI,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
};

export default config;