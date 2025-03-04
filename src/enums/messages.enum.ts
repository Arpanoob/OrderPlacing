export enum messages {
    SERVER_RUNNING = "Server running on port",
    DB_CONNECTED_SUCESSFULLY = "MongoDB connected successfully",
    MONGO_CONNECTION_ERROR = " MongoDB connection error:",
    Already_Registered = "User already registered",
    LOGIN_SUCESSFULL = "Login successful",
    NOTFOUND_IN_REDIS = "Not Found in redis storage , requesting from DB",
    FOUND_IN_REDIS = "Found in redis",
    ACCESS_DENIED = "Access Denied. No token provided.",
    INVALID_OR_EXPIRED_TOKEN = "Invalid or expired token.",
    LOADED_ENVS = "Loaded environment:",
    USER_NOT_FOUND = "User not Found",
    FAILED_PROCESSING_ORDER = "Failed processing order",
    ORDER_RECIVED = "Order Recived"
}