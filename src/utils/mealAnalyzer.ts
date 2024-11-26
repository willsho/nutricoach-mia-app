import { foodCalorieDatabase } from '../data/foodCalorieDatabase'

interface AnalysisResult {
  time: string
  foods: Array<{
    name: string
    quantity: string
    calories: number
  }>
  totalCalories: number
}

export async function analyzeMealInput(input: string): Promise<AnalysisResult> {
  // 这里是一个简单的实现，实际项目中可能需要更复杂的自然语言处理
  
  // 1. 提取时间
  const timePattern = /(\d{1,2})[点:时]|上午|中午|下午|晚上/
  const timeMatch = input.match(timePattern)
  const time = timeMatch ? timeMatch[0] : '未指定时间'

  // 2. 识别食物和数量
  const foods = Object.keys(foodCalorieDatabase).reduce((acc, foodName) => {
    if (input.includes(foodName)) {
      // 尝试匹配这个食物前面的数量
      const quantityPattern = new RegExp(`([一二三四五六七八九十]|[0-9]+)(个|碗|盘|份)${foodName}`)
      const match = input.match(quantityPattern)
      
      const quantity = match ? match[1] + match[2] : '1份'
      const baseCalories = foodCalorieDatabase[foodName]
      
      // 根据数量计算卡路里
      let multiplier = 1
      if (match) {
        // 将中文数字转换为阿拉伯数字
        const numMap: Record<string, number> = {
          '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
          '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
        }
        multiplier = numMap[match[1]] || parseInt(match[1])
      }

      acc.push({
        name: foodName,
        quantity,
        calories: baseCalories * multiplier
      })
    }
    return acc
  }, [] as AnalysisResult['foods'])

  // 3. 计算总热量
  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)

  return {
    time,
    foods,
    totalCalories
  }
} 