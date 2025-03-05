import { EventTypes } from "../enums/event.enum";
import { eventBus } from "../events/eventBus.event";
import connectDB from "../models/db";
import { withRetry } from "../utils/retry";

eventBus.on(EventTypes.SERVER_STARTED, async () => {
    try {
        await withRetry(async () => {
            await connectDB();
        }, 3, 1000)
        eventBus.emit(EventTypes.DB_CONNECTED)
    }
    catch (error) {
        eventBus.emit(EventTypes.Error, { error })
    }
})