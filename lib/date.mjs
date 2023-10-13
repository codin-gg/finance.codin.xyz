export const INTERVALS = new Map([
  ['5y', 157680000000], // → 1d
  ['3y', 94608000000], // → 1d
  ['2y', 63072000000], // → 1d
  ['1y', 31536000000], // → 1d
  ['4m', 10368000000], // → 1d
  ['3m', 7776000000], // → 1d
  ['2m', 5184000000], // → 1d
  ['1m', 2592000000], // → 1d
  ['3w', 1814400000], // → 1d
  ['2w', 1209600000], // → 1d
  ['1w', 604800000], // → 1d
  ['3d', 259200000], // → 1d
  ['2d', 172800000], // → 1d
  ['1d', 86400000],
  ['12h', 43200000], // → 6h
  ['6h', 21600000],
  ['3h', 10800000], // → 1h
  ['2h', 7200000],
  ['1h', 3600000],
  ['30', 1800000],
  ['15', 900000],
  ['10', 600000], // → 5
  ['5', 300000],
  ['3', 180000], // → 1
  ['2', 120000], // → 1
  ['1', 60000]
])

export function parseInterval (interval) {
  const number = parseFloat(interval)
  const unit = interval.replace(number.toString(), '').toLowerCase()
  switch (unit) {
    case 'y':
      return number * 31536000000
    case 'm':
      return number * 2592000000
    case 'w':
      return number * 604800000
    case 'd':
      return number * 86400000
    case 'h':
      return number * 3600000
    default:
      return number * 60000
  }
}

export function daysBetween (date1, date2, oneDay = INTERVALS.get('1d')) {
  return Math.round(
    Math.abs(
      new Date(date1).getTime() - new Date(date2).getTime()
    ) / oneDay
  )
}

export function utcDate (now = new Date()) {
  return new Date(now.getTime() + (now.getTimezoneOffset() * 6e4))
}

export function jsonDateReviver (_, value, iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/) {
  return typeof value === 'string' && iso8601Regex.test(value)
    ? new Date(value)
    : value
}

export function csvDateReplacer (_, value) {
  return Array.isArray(value)
    ? value.map(replaceIfDate)
    : replaceIfDate(value)

  function replaceIfDate (date) {
    return date instanceof Date
      ? date.toISOString().slice(0, 16).replace('T', ' ')
      : date
  }
}

export function dateReplacerFor (interval) {
  return /\d+[dwmy]/.test(interval)
    ? (_, value) => value === new Date(value).toJSON() ? new Date(value).toJSON().substring(0, 10) : value
    : (_, value) => value
}
