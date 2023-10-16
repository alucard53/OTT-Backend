declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string;
            MONGO_URI: string;
            STRIPE_PK: string;
            JWT_KEY: string;
            // add more environment variables and their types here
        }
    }
}