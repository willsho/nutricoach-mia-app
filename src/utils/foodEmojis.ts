// 基础食物 emoji 映射
const basicFoodEmojis: Record<string, string> = {
  // 主食类
  '米饭': '🍚',
  '面包': '🍞',
  '糙米': '🍚',
  '全麦': '🍞',
  '面条': '🍜',
  '馒头': '🍞',
  
  // 蛋奶类
  '牛奶': '🥛',
  '鸡蛋': '🥚',
  '酸奶': '🥛',
  
  // 肉类
  '鸡肉': '🐔',
  '鸡胸肉': '🐔',
  '猪肉': '🥩',
  '牛肉': '🥩',
  '三文鱼': '🍣',
  '鱼': '🐟',
  
  // 蔬菜类
  '西兰花': '🥦',
  '胡萝卜': '🥕',
  '沙拉': '🥗',
  '生菜': '🥬',
  '番茄': '🍅',
  
  // 水果类
  '苹果': '🍎',
  '香蕉': '🍌',
  '橙子': '🍊',
  
  // 其他
  '藜麦': '🌾',
}

export const getFoodEmoji = (foodName: string): string => {
  // 1. 直接匹配完整食物名
  if (basicFoodEmojis[foodName]) {
    return basicFoodEmojis[foodName]
  }
  
  // 2. 关键词匹配
  for (const [key, emoji] of Object.entries(basicFoodEmojis)) {
    if (foodName.includes(key)) {
      return emoji
    }
  }
  
  // 3. 返回默认值
  return '🍽️'
}

// 用于测试 emoji 映射是否正确
export const testFoodEmoji = (foodName: string): void => {
  console.log(`Food: ${foodName}, Emoji: ${getFoodEmoji(foodName)}`)
} 