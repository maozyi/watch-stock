/**
 * 配置管理模块
 */

const vscode = require("vscode");

const CONFIG_SECTION = "watch-stock";
const DEFAULT_STOCKS = ["sh000001"]; // 默认值：上证指数
const DEFAULT_INDICES = ["sh000001", "sz399001", "sz399006"]; // 默认指数：上证、深成、创业板
const DEFAULT_SECTORS = ["sh512760", "sh512690", "sh512170", "sh515790"]; // 默认板块：半导体、酒、医疗、光伏

/**
 * 获取配置对象
 */
function getConfig() {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

/**
 * 验证股票代码格式
 * @param {string} code - 股票代码
 * @returns {boolean} 是否为有效格式
 */
function isValidStockCode(code) {
  return code && typeof code === "string" && /^(sh|sz|bj)[0-9]{6}$/i.test(code);
}

/**
 * 获取并验证代码列表的通用函数
 * @param {string} configKey - 配置项键名
 * @param {string[]} defaultValue - 默认值
 * @returns {string[]} 验证后的代码数组
 */
function getValidatedCodes(configKey, defaultValue) {
  const config = getConfig();
  const codes = config.get(configKey, defaultValue);

  // 验证所有代码格式
  const validCodes = codes.filter((code) => isValidStockCode(code));

  // 如果数据有问题,重置为默认值
  if (validCodes.length === 0 || validCodes.length !== codes.length) {
    config.update(configKey, defaultValue, vscode.ConfigurationTarget.Global);
    return defaultValue;
  }

  // 统一转换为小写
  return validCodes.map((code) => code.toLowerCase());
}

/**
 * 获取股票代码列表
 * @returns {string[]} 股票代码数组
 */
function getStocks() {
  return getValidatedCodes("stocks", DEFAULT_STOCKS);
}

/**
 * 保存股票代码列表
 * @param {string[]} stocks - 股票代码数组
 */
async function saveStocks(stocks) {
  const config = getConfig();
  // 确保所有代码都是标准格式
  const normalizedStocks = stocks
    .map((code) => code.toLowerCase())
    .filter((code) => isValidStockCode(code));
  await config.update(
    "stocks",
    normalizedStocks,
    vscode.ConfigurationTarget.Global
  );
}

/**
 * 获取刷新间隔
 * @returns {number} 刷新间隔（毫秒）
 */
function getRefreshInterval() {
  const config = getConfig();
  return config.get("refreshInterval", 5000);
}

/**
 * 获取最大显示数量
 * @returns {number} 最大显示股票数量
 */
function getMaxDisplayCount() {
  const config = getConfig();
  return config.get("maxDisplayCount", 5);
}

/**
 * 是否显示2位简称
 * @returns {boolean}
 */
function getShowTwoLetterCode() {
  const config = getConfig();
  return config.get("showTwoLetterCode", false);
}

/**
 * 获取指数代码列表
 * @returns {string[]} 指数代码数组
 */
function getIndices() {
  return getValidatedCodes("indices", DEFAULT_INDICES);
}

/**
 * 获取板块代码列表
 * @returns {string[]} 板块代码数组
 */
function getSectors() {
  return getValidatedCodes("sectors", DEFAULT_SECTORS);
}

module.exports = {
  getStocks,
  saveStocks,
  getRefreshInterval,
  getMaxDisplayCount,
  getShowTwoLetterCode,
  getIndices,
  getSectors,
};
