/**
 * Converte SQL com placeholders MySQL (?) para PostgreSQL ($1, $2, etc.)
 * @param {string} sql - SQL com placeholders ?
 * @param {Array} params - Array de parâmetros
 * @returns {{sql: string, params: Array}} SQL e params convertidos
 */
export function convertMySQLToPostgres(sql, params = []) {
  let paramIndex = 1;
  const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { sql: convertedSql, params };
}

/**
 * Wrapper para pool.query que converte automaticamente
 * @param {Pool} pool - PostgreSQL pool
 * @param {string} sql - SQL com placeholders MySQL
 * @param {Array} params - Parâmetros
 * @returns {Promise<{rows: Array, rowCount: number}>}
 */
export async function queryWithConversion(pool, sql, params = []) {
  const { sql: convertedSql, params: convertedParams } = convertMySQLToPostgres(sql, params);
  return pool.query(convertedSql, convertedParams);
}
