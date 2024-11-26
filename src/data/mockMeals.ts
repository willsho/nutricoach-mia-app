import { Meal } from '../types/food';

export const todayMeals: Meal[] = [
  {
    id: '1',
    type: '早餐',
    time: '08:30',
    totalCalories: 450,
    foods: [
      {
        id: '1-1',
        name: '全麦面包',
        quantity: '2片',
        calories: 160,
        imageUrl: 'https://placehold.co/100x100?text=🍞'
      },
      {
        id: '1-2',
        name: '牛奶',
        quantity: '250ml',
        calories: 150,
        imageUrl: 'https://placehold.co/100x100?text=🥛'
      },
      {
        id: '1-3',
        name: '煮鸡蛋',
        quantity: '1个',
        calories: 140,
        imageUrl: 'https://placehold.co/100x100?text=🥚'
      }
    ]
  },
  {
    id: '2',
    type: '午餐',
    time: '12:30',
    totalCalories: 650,
    foods: [
      {
        id: '2-1',
        name: '糙米饭',
        quantity: '1碗',
        calories: 200,
        imageUrl: 'https://placehold.co/100x100?text=🍚'
      },
      {
        id: '2-2',
        name: '清炒西兰花',
        quantity: '200g',
        calories: 150,
        imageUrl: 'https://placehold.co/100x100?text=🥦'
      },
      {
        id: '2-3',
        name: '清蒸鸡胸肉',
        quantity: '150g',
        calories: 300,
        imageUrl: 'https://placehold.co/100x100?text=🍗'
      }
    ]
  },
  {
    id: '3',
    type: '晚餐',
    time: '18:30',
    totalCalories: 550,
    foods: [
      {
        id: '3-1',
        name: '藜麦沙拉',
        quantity: '250g',
        calories: 220,
        imageUrl: 'https://placehold.co/100x100?text=🥗'
      },
      {
        id: '3-2',
        name: '三文鱼',
        quantity: '120g',
        calories: 330,
        imageUrl: 'https://placehold.co/100x100?text=🐟'
      }
    ]
  }
]; 