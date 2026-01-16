/**
 * 股票管理模块
 * 处理股票的添加、删除、清空等操作
 */

const vscode = require("vscode");
const { isValidStockCode } = require("../utils/stockCode");
const { searchStockCode } = require("../services/stockSearch");
const { getStockList } = require("../services/stockService");
const { getStocks, saveStocks } = require("../config");

class StockManager {
  /**
   * 添加股票（支持连续添加）
   * @param {Function} onUpdate - 更新回调函数
   */
  async addStock(onUpdate) {
    let addedCount = 0;
    
    while (true) {
      const input = await vscode.window.showInputBox({
        prompt: addedCount > 0 
          ? `已添加 ${addedCount} 只股票，继续输入或按 ESC 退出`
          : "请输入股票代码或名称（按 ESC 退出）",
        placeHolder: "例如: sh600519 或 sz000001 或 贵州茅台",
        validateInput: (value) => {
          // 允许空值（用于退出）
          if (!value || value.trim().length === 0) {
            return null;
          }
          if (value.trim().length > 20) {
            return "输入内容过长，请重新输入";
          }
          return null;
        },
      });

      // 用户按 ESC 或输入为空，退出循环
      if (!input || !input.trim()) {
        if (addedCount > 0) {
          vscode.window.showInformationMessage(
            `添加完成！共添加了 ${addedCount} 只股票`
          );
        }
        break;
      }

      const stockInput = input.trim();
      let stockCode = stockInput;

      const isCode = isValidStockCode(stockInput);

      // 如果不是标准代码格式，则尝试搜索
      if (!isCode) {
        stockCode = await searchStockCode(stockInput);
      }

      if (!stockCode) {
        vscode.window.showErrorMessage(
          `股票获取失败："${stockInput}"\n\n` +
            "可能的原因：\n" +
            "• 股票名称或代码输入错误\n" +
            "• 该股票不存在或已退市\n" +
            "• 网络连接问题\n\n" +
            "请尝试：\n" +
            "• 使用股票代码（如：sh601318）\n" +
            "• 检查股票名称拼写\n" +
            "• 稍后重试"
        );
        continue; // 失败后继续添加
      }

      // 检查是否已存在
      const stocks = getStocks();
      if (stocks.includes(stockCode.toLowerCase())) {
        vscode.window.showWarningMessage("该股票已存在，请添加其他股票");
        continue; // 已存在继续添加
      }

      // 验证股票是否存在
      const stockInfo = await getStockList([stockCode]);
      if (!stockInfo || !stockInfo[0]?.name) {
        vscode.window.showErrorMessage("股票获取失败，请检查股票代码或名称");
        continue; // 失败后继续添加
      }

      // 添加股票
      stocks.push(stockCode.toLowerCase());
      await saveStocks(stocks);
      addedCount++;
      
      // 添加成功的即时反馈（不阻塞）
      vscode.window.showInformationMessage(
        `✅ 已添加: ${stockInfo[0].name}(${stockInfo[0].code})`
      );

      // 触发更新
      if (onUpdate) {
        onUpdate();
      }
    }
  }

  /**
   * 移除股票（支持连续移除）
   * @param {Function} onUpdate - 更新回调函数
   */
  async removeStock(onUpdate) {
    let stocks = getStocks();
    if (stocks.length === 0) {
      vscode.window.showInformationMessage("当前没有添加任何股票");
      return;
    }

    let removedCount = 0;
    const totalCount = stocks.length;

    while (true) {
      // 重新获取最新的股票列表
      stocks = getStocks();
      
      if (stocks.length === 0) {
        vscode.window.showInformationMessage(
          `已移除所有股票！共移除了 ${removedCount} 只`
        );
        break;
      }

      // 获取股票名称用于显示
      const stockInfos = await getStockList(stocks);

      const stockOptions = stocks.map((code) => {
        const info = stockInfos.find((s) => s && s.code === code);
        return {
          label: info ? `${info.name}(${info.code})` : code,
          description: "点击移除",
          code: code,
        };
      });

      const placeHolder = removedCount > 0
        ? `已移除 ${removedCount}/${totalCount} 只股票，继续选择或按 ESC 退出`
        : `选择要移除的股票（共 ${stocks.length} 只，按 ESC 退出）`;

      const selected = await vscode.window.showQuickPick(stockOptions, {
        placeHolder: placeHolder,
      });

      // 用户按 ESC 退出
      if (!selected) {
        if (removedCount > 0) {
          vscode.window.showInformationMessage(
            `移除完成！共移除了 ${removedCount} 只股票`
          );
        }
        break;
      }

      // 移除选中的股票
      const newStocks = stocks.filter((s) => s !== selected.code);
      await saveStocks(newStocks);
      removedCount++;

      // 移除成功的即时反馈
      vscode.window.showInformationMessage(`✅ 已移除: ${selected.label}`);

      // 触发更新
      if (onUpdate) {
        onUpdate();
      }
    }
  }

  /**
   * 清空所有股票
   * @param {Function} onUpdate - 更新回调函数
   */
  async clearStocks(onUpdate) {
    const stocks = getStocks();
    if (stocks.length === 0) {
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      "确定要清空所有自选股票吗？",
      "确定",
      "取消"
    );

    if (confirm === "确定") {
      await saveStocks([]);
      vscode.window.showInformationMessage("已清空所有自选股票");

      // 触发更新
      if (onUpdate) {
        onUpdate();
      }
    }
  }
}

module.exports = StockManager;
