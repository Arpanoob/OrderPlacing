export enum options {
    SAMESITE_STRICT = "strict",
    COOKIIE_NAME = "token",
    EMAIL = "email",
    Password = "password",
    USER_SCHEMA = "user",
    ORDER_SCHEMA = "Order",
    INVENTORY_SCHEMA = "Inventory",
    DATE_FORMATE = "YYYY-MM-DD HH:mm:ss",
    INFO = "info"
}

export enum PATH {
    LOGS = "logs/app.log"
}

export enum ENDPOINTS {
    AUTH_START = '/api/auth',
    API="/api",
    REGISTER="/register",
    LOGIN="/login",
    REFRESH="/refresh",
    CREATE_ORDER="/orders",
    GET_ORDER_DETAILS="/orders/:id"
}

export enum TEXTS {
    ENV=".env.",
    IN="in",
    MODE="mode",
    Email_SENDED_TO="Email Sucessfully sended to ",
    PROCESSING_ORDER="Processing order:"
}