export const createIndexMatcher = (
  indexMap: any,
  name: string,
  opts: any = {}
) => {
  const defaults = {
    warn: () => ({})
  };
  opts = {
    ...opts,
    ...defaults
  };

  const { warn } = opts;

  return (position: any, assignValue: string) => {
    const { line, column } = position;
    const indexLine = indexMap[line];
    const namedIndexMap = indexLine[name];
    if (!namedIndexMap) {
      return warn(`indexMatcher: No map defined for ${name}`);
    }

    const keys = Object.keys(namedIndexMap);
    let keyIndex;
    const key = keys.find((key, idx) => {
      const found = Number(key) > column;
      keyIndex = idx;
      return found;
    });

    if (!key) {
      return warn(
        `indexMatcher: key - ${name} could not find match for ${line}:${column} - ${key}`
      );
    }

    const closestKeyIndex = keyIndex - 1;
    const closestKey = keys[closestKeyIndex];
    if (!closestKey) {
      return warn(
        `indexMatcher: closest key - ${name} could not find match for ${line}:${column} - ${closestKeyIndex} ${closestKey}`
      );
    }
    const closestObj = namedIndexMap[closestKey];
    // check if value being typed matches value for assignment
    const { valueAssigned } = closestObj;
    const valueMatch = assignValue === valueAssigned;
    const index = Number(closestKey);
    const data = closestObj;
    return { data, column: index, valueMatch };
  };
};
