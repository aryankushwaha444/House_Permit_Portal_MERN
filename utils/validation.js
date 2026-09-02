const required = (body, fields) =>
  fields.filter((field) => body[field] === undefined || body[field] === "");
const validPermit = (body) => {
  const missing = required(body, [
    "propertyAddress",
    "propertyType",
    "constructionType",
    "plotArea",
    "buildingArea",
    "estimatedCost",
  ]);
  const invalid = ["plotArea", "buildingArea", "estimatedCost"].filter(
    (key) => Number.isNaN(Number(body[key])) || Number(body[key]) < 0
  );
  return { missing, invalid };
};
module.exports = { required, validPermit };
