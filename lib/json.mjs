export function dateReviver (_, value, iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/) {
  return typeof value === 'string' && iso8601Regex.test(value)
    ? new Date(value)
    : value
}
