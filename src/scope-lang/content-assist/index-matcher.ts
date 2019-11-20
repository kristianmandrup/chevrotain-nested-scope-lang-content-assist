export const createIndexMatcher = (indexMap: any, name: string) => {
  return (position: any) => {
    const { line, column } = position;
    const indexLine = indexMap[line];
    const namedIndexMap = indexLine[name];
    if (!namedIndexMap) {
      throw `indexMatcher: No map defined for ${name}`;
    }

    const keys = Object.keys(namedIndexMap);
    let keyIndex;
    const key = keys.find((key, idx) => {
      const found = Number(key) > column;
      keyIndex = idx;
      return found;
    });

    if (!key) {
      throw `indexMatcher: key - ${name} could not find match for ${line}:${column} - ${key}`;
    }

    const closestKeyIndex = keyIndex - 1;
    const closestKey = keys[closestKeyIndex];
    if (!closestKey) {
      throw `indexMatcher: closest key - ${name} could not find match for ${line}:${column} - ${closestKeyIndex} ${closestKey}`;
    }
    const closestObj = namedIndexMap[closestKey];
    const index = Number(closestKey);
    const data = closestObj;
    return { data, column: index };
  };
};
