export enum EXCEPTION {
    UNCAUGHT = 'UNCAUGHT EXCEPTION!  Shutting down...',
    UNHANDLED_REJECTION = "UNHANDLED REJECTION!  Shutting down...",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    ERROR = "ERROR : ",
    MISSING_URI = "MONGO_URI is missing in environment variables",
    INVALID_ID_PASSWORD = "Invalid email or password",
    TOKEN_REFRESH_SUCESSFULLY = "Token refreshed successfully",
    USER_NOT_FOUND = "User not found",
    USER_ID_NOT_FOUND = "User ID not found",
    TOKEN_REFRESH_ERROR = "Token refresh error:",
    LOGIN_ERROR = "Login error:",
    REGISTRATION_ERROR = "Registration error:",
    INSUFFICIENT_STOCK_FOR_PRODUCT = "Insufficient stock for product",
    ORDER_NOTFOUND="Order not found",
    SQS_POOLING_ERROR="SQS Polling Error: "
}