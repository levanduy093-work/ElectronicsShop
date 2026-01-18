import { getProducts, login } from '../api';
import * as networkUtils from '../../utils/network';

// Mock network utilities
jest.mock('../../utils/network', () => ({
  getCurrentNetworkStatus: jest.fn(() => ({ isConnected: true })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        {
          _id: '1',
          name: 'Test Product',
          price: { originalPrice: 100000, salePrice: 80000 },
          stock: 10,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const result = await getProducts();

      expect(result).toEqual(mockProducts);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle network errors', async () => {
      (networkUtils.getCurrentNetworkStatus as jest.Mock).mockReturnValueOnce({
        isConnected: false,
      });

      await expect(getProducts()).rejects.toThrow('Không có kết nối mạng');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });

      await expect(getProducts()).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        user: { _id: '1', email: 'test@example.com' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        }),
      );
    });
  });
});
