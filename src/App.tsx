import { useState } from 'react'
import { Drawer, TextField, Button, IconButton } from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useNavigate } from 'react-router-dom'
import { todayMeals } from './data/mockMeals'
import { getFoodEmoji } from './utils/foodEmojis'
import './App.css'

// 设置 dayjs 语言为中文
dayjs.locale('zh-cn')

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [mealInput, setMealInput] = useState('')
  const navigate = useNavigate()

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0)
  const today = dayjs()

  const handleSubmit = () => {
    if (mealInput.trim()) {
      const encodedInput = encodeURIComponent(mealInput)
      navigate(`/analysis?input=${encodedInput}`)
    }
  }

  const handleDateSelect = (date: dayjs.Dayjs | null) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM-DD')
      navigate(`/daily/${formattedDate}`)
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>今日饮食记录</h1>
            <div className="current-date">
              {today.format('M月D日 dddd')}
            </div>
          </div>
          <IconButton 
            className="calendar-button"
            onClick={() => setIsCalendarOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
        </div>
        <div className="total-calories">
          总热量：{totalCalories} 千卡
        </div>
      </header>
      
      <main className="meals-container">
        {todayMeals.map(meal => (
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
      </main>

      <button 
        className="floating-button"
        onClick={() => setIsDrawerOpen(true)}
      >
        + 记录
      </button>

      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          className: "drawer-content"
        }}
      >
        <div className="drawer-header">
          <h2>添加饮食记录</h2>
          <button 
            className="close-button"
            onClick={() => setIsDrawerOpen(false)}
          >
            关闭
          </button>
        </div>
        <div className="drawer-body">
          <TextField
            fullWidth
            multiline
            rows={4}
            label="描述你的用餐"
            placeholder="例如：今天中午12点吃了一碗米饭、两个鸡蛋和一盘西兰花"
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            variant="outlined"
            className="meal-input"
          />
          <Button 
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            className="submit-button"
            disabled={!mealInput.trim()}
          >
            分析记录
          </Button>
        </div>
      </Drawer>

      <Drawer
        anchor="bottom"
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        PaperProps={{
          className: "calendar-drawer"
        }}
      >
        <div className="drawer-header">
          <h2>选择日期</h2>
          <button 
            className="close-button"
            onClick={() => setIsCalendarOpen(false)}
          >
            关闭
          </button>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar 
            onChange={handleDateSelect}
            disableFuture
            sx={{
              width: '100%',
              '.MuiPickersDay-root': {
                fontSize: '14px',
              },
              '.MuiDayCalendar-header': {
                paddingTop: '8px',
              },
              '.MuiPickersDay-today': {
                border: '1px solid #333',
              },
              '.MuiPickersDay-root.Mui-selected': {
                backgroundColor: '#333',
              },
            }}
          />
        </LocalizationProvider>
      </Drawer>
    </div>
  )
}

export default App
