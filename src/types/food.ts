export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  imageUrl: string;
}

export interface Meal {
  id: string;
  type: '早餐' | '午餐' | '晚餐' | '加餐';
  time: string;
  foods: FoodItem[];
  totalCalories: number;
} 