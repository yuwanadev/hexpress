'use strict';

/** "user-order" → "UserOrder" */
function pascal(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/** "user-order" → "userOrder" */
function camel(str) {
  const p = pascal(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

/** "UserOrder" | "user-order" → "user-order" */
function kebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]/g, '-')
    .toLowerCase();
}

/** "UserOrder" | "user-order" → "userorder" */
function lower(str) {
  return kebab(str).replace(/-/g, '');
}

module.exports = { pascal, camel, kebab, lower };
