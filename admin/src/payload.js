/** Convert collected form values into a database-safe payload. */
export function buildPayload(config, values) {
  const payload = {};
  for (const field of config.fields) {
    if (field.name.startsWith('__')) continue;
    let value = values[field.name];
    switch (field.type) {
      case 'checkbox':
        payload[field.name] = Boolean(value);
        break;
      case 'number':
        payload[field.name] = value === null || value === undefined || Number.isNaN(value)
          ? (field.nullable ? null : 0)
          : Number(value);
        break;
      case 'tags':
      case 'links':
      case 'gallery':
        payload[field.name] = Array.isArray(value) ? value : [];
        break;
      default:
        if ((value === '' || value === null || value === undefined) && isNullable(field)) {
          payload[field.name] = null;
        } else {
          payload[field.name] = value ?? '';
        }
    }
  }
  return payload;
}

function isNullable(field) {
  return field.nullable === true
    || ['url', 'image', 'date'].includes(field.type)
    // Category selectors store UUID foreign keys; PostgreSQL expects NULL,
    // never the empty string, when no category is selected.
    || Boolean(field.optionsFromCategories);
}
