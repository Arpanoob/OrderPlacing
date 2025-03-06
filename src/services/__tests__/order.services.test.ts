import { Order } from "../../models/order.model";
import { createOrder, getOrderById, updateOrderStatus } from "../order.services";
import { checkInventory } from "../inventory.service";
import redisClient from "../../models/radisdb";
import { eventBus } from "../../events/eventBus.event";
import { ORDERS } from "../../enums/orders.enum";
import { EXCEPTION } from "../../enums/warnings.enum";
import { messages } from "../../enums/messages.enum";
import { EventTypes } from "../../enums/event.enum";

// Mock dependencies
jest.mock("../../models/order.model");
jest.mock("../inventory.service");
jest.mock("../../models/radisdb");
jest.mock("../../events/eventBus.event");
jest.mock("uuid", () => ({
  v4: () => "mocked-uuid"
}));

describe("Order Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    const mockOrderData = {
      userId: "user123",
      items: [{ productId: "prod1", quantity: 2 }],
      totalAmount: 100
    };

    const mockCreatedOrder = {
      orderId: "mocked-uuid",
      userId: "user123",
      items: [{ productId: "prod1", quantity: 2 }],
      totalAmount: 100,
      status: ORDERS.Pending
    };

    it("should create an order successfully", async () => {
      // Mock dependencies
      (checkInventory as jest.Mock).mockResolvedValue(true);
      (Order.create as jest.Mock).mockResolvedValue(mockCreatedOrder);
      (eventBus.emit as jest.Mock).mockImplementation(() => {});

      const result = await createOrder(
        mockOrderData.userId,
        mockOrderData.items,
        mockOrderData.totalAmount
      );

      expect(checkInventory).toHaveBeenCalledWith(mockOrderData.items, mockOrderData.totalAmount);
      expect(Order.create).toHaveBeenCalledWith({
        orderId: "mocked-uuid",
        userId: mockOrderData.userId,
        items: mockOrderData.items,
        totalAmount: mockOrderData.totalAmount,
        status: ORDERS.Pending
      });
      expect(eventBus.emit).toHaveBeenCalledWith(EventTypes.OrderCreated, { order: mockCreatedOrder });
      expect(result).toEqual(mockCreatedOrder);
    });

    it("should throw error when inventory check fails", async () => {
      (checkInventory as jest.Mock).mockRejectedValue(new Error("Insufficient inventory"));

      await expect(
        createOrder(mockOrderData.userId, mockOrderData.items, mockOrderData.totalAmount)
      ).rejects.toThrow("Insufficient inventory");

      expect(Order.create).not.toHaveBeenCalled();
      expect(eventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe("getOrderById", () => {
    const mockOrderId = "order123";
    const mockOrder = {
      orderId: mockOrderId,
      userId: "user123",
      items: [{ productId: "prod1", quantity: 2 }],
      totalAmount: 100,
      status: ORDERS.Pending
    };

    it("should return order from cache if available", async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockOrder));

      const result = await getOrderById(mockOrderId);

      expect(redisClient.get).toHaveBeenCalledWith(`order:${mockOrderId}`);
      expect(Order.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it("should fetch from database and cache when not in cache", async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);
      (redisClient.set as jest.Mock).mockResolvedValue("OK");

      const result = await getOrderById(mockOrderId);

      expect(redisClient.get).toHaveBeenCalledWith(`order:${mockOrderId}`);
      expect(Order.findOne).toHaveBeenCalledWith({ orderId: mockOrderId });
      expect(redisClient.set).toHaveBeenCalledWith(
        `order:${mockOrderId}`,
        JSON.stringify(mockOrder),
        "EX",
        600
      );
      expect(result).toEqual(mockOrder);
    });

    it("should throw error when order not found", async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (Order.findOne as jest.Mock).mockResolvedValue(null);

      await expect(getOrderById(mockOrderId)).rejects.toThrow(EXCEPTION.ORDER_NOTFOUND);
    });
  });

  describe("updateOrderStatus", () => {
    const mockOrderId = "order123";
    const mockStatus = ORDERS.Processed;

    it("should update order status successfully", async () => {
      (Order.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await updateOrderStatus(mockOrderId, mockStatus);

      expect(Order.updateOne).toHaveBeenCalledWith(
        { orderId: mockOrderId },
        { status: mockStatus }
      );
    });

    it("should handle update failure", async () => {
      (Order.updateOne as jest.Mock).mockRejectedValue(new Error("Update failed"));

      await expect(updateOrderStatus(mockOrderId, mockStatus)).rejects.toThrow("Update failed");
    });
  });
}); 