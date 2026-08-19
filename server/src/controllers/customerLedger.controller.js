import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { getCustomerLedger } from "../services/customerLedger.service.js";

export const getLedger = asyncHandler(async (req, res) => {
  const ledger = await getCustomerLedger(req.params.customerId);

  return res.json(
    new ApiResponse(200, ledger, "Customer ledger fetched successfully."),
  );
});
