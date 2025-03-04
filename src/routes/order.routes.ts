import { Router } from "express";
import { createOrderHandler, getOrderHandler } from "../controller/order.controller";
import { ENDPOINTS } from "../enums/options.enum";

const router = Router();

router.post(ENDPOINTS.CREATE_ORDER, createOrderHandler);
router.get(ENDPOINTS.GET_ORDER_DETAILS, getOrderHandler);

export default router;
