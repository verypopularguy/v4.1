export function getRandomID () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

/**
 * Displays the date in the user's local time
 * 
 * @param {String} isoString 
 * @returns a human readable form of the date e.g. March 24th 5:46
 */
 export const displayDate = function (isoString, format = {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'utc',
}) 
{ 
  const deserializedDate = new Date(isoString)
  let currentTimeZoneOffset = deserializedDate.getTimezoneOffset() * 60000;
  return new Date(deserializedDate - currentTimeZoneOffset).toLocaleDateString(
    'en-US',
    format
  );
} 

// rounds to nearest 0.1, see https://stackoverflow.com/a/12698296/7812829
export function roundedToFixed(input, digits) {
  var rounded = Math.pow(10, digits);
  return (Math.round(input * rounded) / rounded).toFixed(digits);
}