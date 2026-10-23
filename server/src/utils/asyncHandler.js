export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
