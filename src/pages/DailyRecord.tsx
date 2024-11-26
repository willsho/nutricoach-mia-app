import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Meal } from '../types/meal'
import { getFoodEmoji } from '../utils/foodEmojis'
import './DailyRecord.css'

export default function DailyRecord() {
  const { date } = useParams()
  const navigate = useNavigate()
  const [meals, setMeals] = useState<Meal[]>([])

  useEffect(() => {
    // 从 localStorage 获取该日期的饮食记录
    const allMealsStr = localStorage.getItem('meals') || '[]'
    const allMeals: Meal[] = JSON.parse(allMealsStr)
    
    // 筛选出对应日期的记录
    // TODO: 实现日期匹配逻辑
    setMeals(allMeals)
  }, [date])

  return (
    <div className="daily-record">
      <div className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          <svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L2 10.5L10 19" stroke="#333333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>{date} 饮食记录</h1>
      </div>

      <div className="meals-container">
        {meals.map(meal => (
          <div key={meal.id} className="meal-card">
            <div className="meal-header">
              <div className="meal-title">
                <h2>{meal.type}</h2>
                <span className="meal-time">{meal.time}</span>
              </div>
              <span className="meal-calories">{meal.totalCalories} 千卡</span>
            </div>
            <div className="food-list">
              {meal.foods.map(food => (
                <div key={food.id} className="food-item">
                  <div className="food-emoji">
                    {getFoodEmoji(food.name)}
                  </div>
                  <div className="food-info">
                    <h3>{food.name}</h3>
                    <span className="food-quantity">{food.quantity}</span>
                  </div>
                  <div className="food-calories">
                    {food.calories} 千卡
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 