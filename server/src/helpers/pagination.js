export const buildPagination = (page, limit, total) => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
pagination: buildPagination(page, limit, total);
