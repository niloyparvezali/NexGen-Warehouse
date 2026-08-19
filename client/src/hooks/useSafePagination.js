import { useEffect } from "react";

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
};

export const getSafePagination = (page, totalPages) => {
  const safeTotalPages = toPositiveInteger(totalPages, 1);
  const safePage = Math.min(toPositiveInteger(page, 1), safeTotalPages);

  return {
    currentPage: safePage,
    totalPages: safeTotalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < safeTotalPages,
  };
};

export const useSafePagination = (page, totalPages, setPage) => {
  const state = getSafePagination(page, totalPages);

  useEffect(() => {
    if (typeof setPage !== "function") return;
    if (Number(page) !== state.currentPage) {
      setPage(state.currentPage);
    }
  }, [page, setPage, state.currentPage]);

  return state;
};

export default useSafePagination;
