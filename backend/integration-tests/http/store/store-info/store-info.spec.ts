import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../../utils/store";

jest.setTimeout(60 * 1000);

/**
 * Covers the custom `GET /store/store-info` route
 * (backend/src/api/store/store-info/route.ts), which drives storefront
 * branding from the backend instead of hardcoding the store name.
 */
medusaIntegrationTestRunner({
  inApp: true,
  env: {
    JWT_SECRET: "supersecret",
  },
  testSuite: ({ api, getContainer }) => {
    let storeHeaders;

    beforeEach(async () => {
      const container = getContainer();
      const publishableKey = await generatePublishableKey(container);
      storeHeaders = generateStoreHeaders({ publishableKey });
    });

    describe("GET /store/store-info", () => {
      it("returns the store id and name", async () => {
        const response = await api.get("/store/store-info", storeHeaders);

        expect(response.status).toEqual(200);
        expect(response.data.store).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          })
        );
      });

      it("rejects requests without a publishable api key", async () => {
        await expect(api.get("/store/store-info")).rejects.toThrow();
      });
    });
  },
});
