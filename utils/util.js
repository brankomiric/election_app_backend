const arrayToObj = (arr, key) => {
  return arr.reduce((p, c) => ({ ...p, [c[key]]: c }), {});
};

module.exports = {
  arrayToObj,
};
