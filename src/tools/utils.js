/**
 * Receives a map that has strigs as keys and integers as values representing the string count.
 * If the value passed is a key in the map, its counter will be increased, else it will be inserted
 * in the map with value = 1.
 * @param {Map} map
 * @param {String} key
 */
function addToMap(map, key) {
  if (map.has(key)) {
    map.set(key, map.get(key) + 1);
  } else {
    map.set(key, 1);
  }
}

/**
 * Receives a map that has strigs as keys and integers as values representing the string count.
 * If the value passed is a key in the map, its counter will be decreased by one, in case the new
 * value is to be 0, the key will be removed from the map.
 * @param {Map} map
 * @param {String} key
 */
function deductFromMap(map, key) {
  if (map.has(key)) {
    const value = map.get(key);

    if (value == 1) {
      map.delete(key);
    } else {
      map.set(key, value - 1);
    }
  }
}

module.exports = {addToMap, deductFromMap}
