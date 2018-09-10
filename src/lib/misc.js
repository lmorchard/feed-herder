// eslint-disable-next-line no-nested-ternary
export const asc = (a, b) => (a < b ? -1 : b < a ? 1 : 0);

export const desc = (a, b) => asc(b, a);
