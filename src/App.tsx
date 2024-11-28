import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Drawer, TextField, Button, IconButton, Snackbar, Alert, Menu, MenuItem } from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { todayMeals } from './data/mockMeals'
import { getFoodEmoji } from './utils/foodEmojis'
import './App.css'
import CameraPage from './pages/CameraPage'
import { Add, PhotoCamera } from '@mui/icons-material';
import Analysis from './pages/Analysis';
import CommonFoodsPage from './pages/CommonFoodsPage';

// 设置 dayjs 语言为中文
dayjs.locale('zh-cn')

// 在文件顶部添加常见食物数组
const COMMON_FOODS = [
  "一碗米饭",
  "蒜蓉西兰花",
  "一杯冰美式350ml",
  "一个水煮蛋",
  "一份炒青菜",
  "一碗牛肉面",
  "一个鸡胸肉",
  "一盘炒河粉",
  "一杯酸奶",
  "一个苹果"
];

// 将主页内容提取为单独的组件
function HomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [mealInput, setMealInput] = useState('')
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const [mealMenuAnchorEl, setMealMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)
  const [isEditMealDrawerOpen, setIsEditMealDrawerOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<typeof todayMeals[0] | null>(null);

  // 在路由变化时重置Drawer状态
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsCalendarOpen(false);
    setIsEditMealDrawerOpen(false);
    setMealMenuAnchorEl(null);
  }, [location.pathname]);

  useEffect(() => {
    // 检查是否有更新后的输入
    if (location.state && 'updatedInput' in location.state) {
      setMealInput(location.state.updatedInput);
      // 清除状态，避免重复设置
      navigate('.', { state: null, replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // 如果是从常用食物页面返回，则打开 drawer
    if (location.state && location.state.openDrawer) {
      setIsDrawerOpen(true);
      // 清除状态，避免重复打开
      navigate('.', { state: null, replace: true });
    }
  }, [location.state, navigate]);

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

  // 处理食物选择
  const handleFoodSelect = (food: string) => {
    if (selectedFoods.includes(food)) {
      // 如果已选中，则取消选中并从输入框中移除
      setSelectedFoods(selectedFoods.filter(f => f !== food));
      setMealInput(prev => prev.replace(food + '、', '').replace(food, '').trim());
    } else {
      // 如果未选中，则选中并添加到输入框
      setSelectedFoods([...selectedFoods, food]);
      setMealInput(prev => {
        const separator = prev ? '、' : '';
        return `${prev}${separator}${food}`;
      });
    }
  };

  // 只显示前6个食物
  const displayedFoods = COMMON_FOODS.slice(0, 6);

  // 修改文本框onChange处理函数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMealInput(newValue);
    
    // 检查已选择的食物是否还在文本框中
    setSelectedFoods(prevSelected => 
      prevSelected.filter(food => newValue.includes(food))
    );
  };

  const handleMealMenuClick = (event: React.MouseEvent<HTMLElement>, mealId: string) => {
    setMealMenuAnchorEl(event.currentTarget);
    setSelectedMealId(mealId);
  };

  const handleMealMenuClose = () => {
    setMealMenuAnchorEl(null);
    setSelectedMealId(null);
  };

  const handleMealMenuItemClick = (action: 'edit' | 'share') => {
    if (action === 'edit') {
      const meal = todayMeals.find(m => m.id === selectedMealId);
      if (meal) {
        setSelectedMeal(meal);
        setIsEditMealDrawerOpen(true);
      }
    } else if (action === 'share') {
      // TODO: 实现分享的逻辑
      console.log('分享', selectedMealId);
    }
    handleMealMenuClose();
  };

  return (
    <div className="app" style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
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
      
      <main className="meals-container" style={{ flex: 1, overflowY: 'auto' }}>
        {todayMeals.map(meal => (
          <div key={meal.id} className="meal-card">
            <div className="meal-header">
              <div className="meal-title">
                <h2>{meal.type}</h2>
                <span className="meal-time">{meal.time}</span>
              </div>
              <div className="meal-header-right">
                <span className="meal-calories">{meal.totalCalories} 千卡</span>
                <IconButton 
                  className="meal-menu-button"
                  onClick={(event) => handleMealMenuClick(event, meal.id)}
                  size="small"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334zM12 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334zM4 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334z" fill="#666"/>
                  </svg>
                </IconButton>
              </div>
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

      <div className="floating-buttons">
        <button 
          className="floating-button record-button"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Add sx={{ width: 20, height: 20 }} /> 记录
        </button>
        
        <button 
          className="floating-button camera-button"
          onClick={() => navigate('/camera')}
          style={{ backgroundColor: '#333' }}
        >
          <PhotoCamera sx={{ width: 20, height: 20 }} />
        </button>
      </div>

      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          className: "drawer-content",
          sx: {
            borderRadius: '24px 24px 0 0',
            padding: '24px',
          }
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
            onChange={handleInputChange}
            variant="outlined"
            className="meal-input"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f5f5f5',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#333',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#333',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#666',
                '&.Mui-focused': {
                  color: '#333',
                },
              },
            }}
          />
          
          <div className="common-foods">
            <div className="common-foods-header">
              <div className="common-foods-label">我常吃的食物：</div>
              <button 
                className="view-more-button"
                onClick={() => navigate('/common-foods', {
                  state: {
                    selectedFoods,
                    currentInput: mealInput
                  }
                })}
              >
                查看更多
              </button>
            </div>
            <div className="common-foods-list">
              {displayedFoods.map((food) => (
                <button
                  key={food}
                  className={`common-food-item ${selectedFoods.includes(food) ? 'selected' : ''}`}
                  onClick={() => handleFoodSelect(food)}
                  type="button"
                >
                  {food}
                </button>
              ))}
            </div>
          </div>

          <Button 
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            className="submit-button"
            disabled={!mealInput.trim()}
            sx={{
              marginTop: '16px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#333',
              '&:hover': {
                backgroundColor: '#444',
              },
              '&.Mui-disabled': {
                backgroundColor: '#ccc',
              },
              fontSize: '16px',
              fontWeight: 'normal',
            }}
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

      <Drawer
        anchor="bottom"
        open={isEditMealDrawerOpen}
        onClose={() => setIsEditMealDrawerOpen(false)}
        PaperProps={{
          className: "drawer-content",
          sx: {
            borderRadius: '24px 24px 0 0',
            padding: '24px',
          }
        }}
      >
        <div className="drawer-header">
          <h2>修改用餐量</h2>
          <button 
            className="close-button"
            onClick={() => setIsEditMealDrawerOpen(false)}
          >
            关闭
          </button>
        </div>
        <div className="drawer-body">
          {selectedMeal && (
            <div className="food-list">
              {selectedMeal.foods.map(food => (
                <div key={food.id} className="food-item">
                  <div className="food-emoji">
                    {getFoodEmoji(food.name)}
                  </div>
                  <div className="food-info">
                    <h3>{food.name}</h3>
                    <TextField
                      value={food.quantity}
                      size="small"
                      variant="outlined"
                      sx={{
                        marginTop: '4px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#333',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#333',
                          },
                          '& input': {
                            padding: '8px 12px',
                            fontSize: '14px',
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="food-calories">
                    {food.calories} 千卡
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button 
            variant="contained"
            fullWidth
            onClick={() => {
              // TODO: 实现保存修改的逻辑
              setIsEditMealDrawerOpen(false);
            }}
            sx={{
              marginTop: '24px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#333',
              '&:hover': {
                backgroundColor: '#444',
              },
              fontSize: '16px',
              fontWeight: 'normal',
            }}
          >
            保存
          </Button>
        </div>
      </Drawer>

      <Menu
        anchorEl={mealMenuAnchorEl}
        open={Boolean(mealMenuAnchorEl)}
        onClose={handleMealMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            minWidth: '180px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            padding: '8px',
            marginTop: '8px',
          },
          '& .MuiList-root': {
            padding: 0,
          },
          '& .MuiMenuItem-root': {
            fontSize: '15px',
            padding: '14px 20px',
            height: '44px',
            borderRadius: '8px',
            color: '#333',
            minHeight: 'unset',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
          '& .MuiDivider-root': {
            margin: '6px 0',
          }
        }}
      >
        <MenuItem onClick={() => handleMealMenuItemClick('edit')}>
          <span>修改用餐量</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.33333 2.66667L13.3333 6.66667M2 14H6L13.3333 6.66667L9.33333 2.66667L2 10V14Z" 
              stroke="#666666" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </MenuItem>
        <div style={{ 
          height: '1px', 
          backgroundColor: '#f0f0f0', 
          margin: '4px 0' 
        }} />
        <MenuItem onClick={() => handleMealMenuItemClick('share')}>
          <span>分享</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5.33333C13.1046 5.33333 14 4.43791 14 3.33333C14 2.22876 13.1046 1.33333 12 1.33333C10.8954 1.33333 10 2.22876 10 3.33333C10 4.43791 10.8954 5.33333 12 5.33333Z" 
              stroke="#666666" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M4 10C5.10457 10 6 9.10457 6 8C6 6.89543 5.10457 6 4 6C2.89543 6 2 6.89543 2 8C2 9.10457 2.89543 10 4 10Z" 
              stroke="#666666" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M12 14.6667C13.1046 14.6667 14 13.7713 14 12.6667C14 11.5621 13.1046 10.6667 12 10.6667C10.8954 10.6667 10 11.5621 10 12.6667C10 13.7713 10.8954 14.6667 12 14.6667Z" 
              stroke="#666666" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M5.72667 9.00667L10.28 11.66M10.2733 4.34L5.72667 6.99333" 
              stroke="#666666" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </MenuItem>
      </Menu>
    </div>
  )
}

// App 组件只负责路由配置
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/common-foods" element={<CommonFoodsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
