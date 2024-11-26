import { Meal } from '../types/meal'

export interface NewMealData {
  date: Date
  type: '早餐' | '午餐' | '晚餐' | '加餐'
  foods: Array<{
    name: string
    quantity: string
    calories: number
    weight?: string
  }>
}

export const saveMeal = async (mealData: NewMealData): Promise<boolean> => {
  try {
    // 获取现有的饮食记录
    const existingMealsStr = localStorage.getItem('meals') || '[]'
    const existingMeals: Meal[] = JSON.parse(existingMealsStr)

    // 创建新的饮食记录
    const newMeal: Meal = {
      id: Date.now().toString(), // 使用时间戳作为ID
      type: mealData.type,
      time: `${mealData.date.getHours()}:${String(mealData.date.getMinutes()).padStart(2, '0')}`,
      foods: mealData.foods.map((food, index) => ({
        id: `${Date.now()}-${index}`,
        ...food
      })),
      totalCalories: mealData.foods.reduce((sum, food) => sum + food.calories, 0)
    }

    // 添加新记录
    existingMeals.push(newMeal)

    // 保存到 localStorage
    localStorage.setItem('meals', JSON.stringify(existingMeals))
    
    return true
  } catch (error) {
    console.error('保存饮食记录失败:', error)
    return false
  }
} 