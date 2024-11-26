export interface Food {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  weight?: string;
  imageUrl?: string;
}

export interface Meal {
  id: string;
  type: '早餐' | '午餐' | '晚餐' | '加餐';
  time: string;
  foods: Food[];
  totalCalories: number;
} 