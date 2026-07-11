import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// Exposes the store's public info (currently just its name) to the
// storefront so branding can be driven from the backend instead of being
// hardcoded in the frontend.
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<{ store: { id: string; name: string } }>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });

  res.json({ store: { id: store.id, name: store.name } });
};
