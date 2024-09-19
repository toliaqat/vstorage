/**
 *
 * @param {string} str
 */
const parseString = (str) => {
  if (str.startsWith("{") || str.startsWith("[")) {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.log(`Error while parsing value "${str}": `, error);
    }
  }
  return str;
};

export const cleanJSON = (input) =>
  typeof input !== "object" || !input
    ? input
    : Array.isArray(input)
    ? input.map((_) => cleanJSON(typeof _ === "string" ? parseString(_) : _))
    : Object.entries(input).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: cleanJSON(
            typeof value === "string" ? parseString(value) : value
          ),
        }),
        {}
      );
