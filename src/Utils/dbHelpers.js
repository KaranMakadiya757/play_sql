import { pool } from "../DB/index.js";

// Escape column names dynamically (simple basic escape)
const escapeColumn = (col) => `\`${col}\``;

// Helper to remove fields from an object
function removeFields(obj, fields) {
  if (!obj || !fields?.length) return obj;
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}

// Helper to remove fields from an array of objects
function removeFieldsFromArray(arr, fields) {
  if (!Array.isArray(arr) || !fields?.length) return arr;
  return arr.map(obj => removeFields(obj, fields));
}

const db = {
  async create(table, data) {
    const keys = Object.keys(data).map(escapeColumn).join(", ");
    const values = Object.values(data);
    const placeholders = values.map(() => "?").join(", ");

    const sql = `INSERT INTO \`${table}\` (${keys}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    return { id: result.insertId, ...data };
  },

  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `\`${key}\` = ?`).join(", ");

    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
    await pool.query(sql, [...values, id]);
    return { id, ...data };
  },

  async findOne(table, conditions = {}, operator = "AND", excludeFields = []) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    if (!keys.length) throw new Error("No conditions provided");

    const logicOp = operator.toUpperCase() === "OR" ? "OR" : "AND";
    const whereClause = keys.map((key) => `\`${key}\` = ?`).join(` ${logicOp} `);

    const sql = `SELECT * FROM \`${table}\` WHERE ${whereClause} LIMIT 1`;
    const [rows] = await pool.query(sql, values);
    return removeFields(rows[0] || null, excludeFields);
  },

  async findById(table, id, excludeFields = []) {
    const sql = `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [id]);
    return removeFields(rows.length ? rows[0] : null, excludeFields);
  },

  async findManyByIds(table, ids, excludeFields = []) {
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT * FROM \`${table}\` WHERE id IN (${placeholders})`;
    const [rows] = await pool.query(sql, ids);
    return removeFieldsFromArray(rows, excludeFields);
  },

  async findAll(table, conditions = {}, excludeFields = []) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.length
      ? `WHERE ${keys.map((key) => `\`${key}\` = ?`).join(" AND ")}`
      : "";

    const sql = `SELECT * FROM \`${table}\` ${whereClause}`;
    const [rows] = await pool.query(sql, values);
    return removeFieldsFromArray(rows, excludeFields);
  },

  async delete(table, id) {
    const sql = `DELETE FROM \`${table}\` WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  }
};

export default db;