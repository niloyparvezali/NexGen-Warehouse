import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { getSupplierLedger } from "../services/supplierLedger.service.js";

export const getLedger = asyncHandler(async (req, res) => {
  const ledger = await getSupplierLedger(req.params.supplierId);

  return res.json(
    new ApiResponse(200, ledger, "Supplier ledger fetched successfully."),
  );
});
