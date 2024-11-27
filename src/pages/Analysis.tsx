import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CircularProgress, Menu, MenuItem } from '@mui/material'
import { analyzeMealInput } from '../utils/mealAnalyzer'
import { getFoodEmoji } from '../utils/foodEmojis'
import { saveMeal } from '../utils/mealStorage'
import { Snackbar, Alert } from '@mui/material'
import './Analysis.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// 设置 dayjs 语言为中文
dayjs.locale('zh-cn')

interface AnalysisResult {
  time: string
  foods: Array<{
    name: string
    quantity: string
    calories: number
    weight?: string
  }>
  totalCalories: number
}

interface AnalysisStep {
  text: string
  status: 'waiting' | 'processing' | 'done'
}

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐'] as const
type MealType = typeof MEAL_TYPES[number]

export default function Analysis() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [analysisState, setAnalysisState] = useState<'loading' | 'done'>('loading')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { text: '已检索营养数据库', status: 'waiting' },
    { text: '正在估算食物的份量', status: 'waiting' }
  ])
  const [mealDate, setMealDate] = useState(dayjs())
  const [mealType, setMealType] = useState<MealType>('午餐')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set())
  const [editedFoods, setEditedFoods] = useState<Record<string, { name: string, quantity: string }>>({})
  const imageData = searchParams.get('input')

  useEffect(() => {
    const mealInput = searchParams.get('input')
    if (mealInput) {
      const decodedInput = decodeURIComponent(mealInput)
      
      // 第一步：检索数据库
      setSteps(prev => prev.map((step, idx) => 
        idx === 0 ? { ...step, status: 'processing' } : step
      ))

      setTimeout(() => {
        // 第一步完成，开始第二步
        setSteps(prev => prev.map((step, idx) => 
          idx === 0 ? { ...step, status: 'done' } : 
          idx === 1 ? { ...step, status: 'processing' } : step
        ))
        
        // 分析输入内容
        analyzeMealInput(decodedInput)
          .then(result => {
            setTimeout(() => {
              // 所有步骤完成
              setSteps(prev => prev.map(step => ({ ...step, status: 'done' })))
              setAnalysisResult(result)
              setAnalysisState('done')
            }, 1000)
          })
      }, 1000)
    }
  }, [searchParams])

  const handleSave = async () => {
    if (!analysisResult) return

    setSaveStatus('saving')
    
    const mealData = {
      date: mealDate,
      type: mealType,
      foods: analysisResult.foods
    }

    const success = await saveMeal(mealData)
    
    if (success) {
      setSaveStatus('success')
      // 保存成功后1秒返回首页
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } else {
      setSaveStatus('error')
    }
  }

  const handleFeedback = () => {
    // TODO: 实现反馈逻辑
    console.log('提交反馈')
  }

  const handleMealHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMealTypeSelect = (type: MealType) => {
    setMealType(type)
    handleClose()
  }

  // 格式化日期显示
  const formatDisplayDate = (date: dayjs.Dayjs) => {
    return `${date.format('M/D')}`
  }

  // 格式化日期为 HTML date input 所需的格式 (YYYY-MM-DD)
  const formatInputDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // 处理日期变化
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    setMealDate(newDate)
    // 防止事件冒泡导致菜单关闭
    e.stopPropagation()
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditedFoods(
      analysisResult?.foods.reduce((acc, food) => ({
        ...acc,
        [food.name]: { name: food.name, quantity: food.quantity }
      }), {}) || {}
    )
  }

  const handleFoodSelect = (foodName: string) => {
    const newSelected = new Set(selectedFoods)
    if (newSelected.has(foodName)) {
      newSelected.delete(foodName)
    } else {
      newSelected.add(foodName)
    }
    setSelectedFoods(newSelected)
  }

  const handleFoodEdit = (foodName: string, field: 'name' | 'quantity', value: string) => {
    setEditedFoods(prev => ({
      ...prev,
      [foodName]: {
        ...prev[foodName],
        [field]: value
      }
    }))
  }

  const handleDeleteSelected = () => {
    if (!analysisResult) return
    const updatedFoods = analysisResult.foods.filter(food => !selectedFoods.has(food.name))
    setAnalysisResult({
      ...analysisResult,
      foods: updatedFoods,
      totalCalories: updatedFoods.reduce((sum, food) => sum + food.calories, 0)
    })
    setSelectedFoods(new Set())
  }

  const handleAddFood = () => {
    // TODO: 实现添加食物的逻辑
    console.log('添加食物')
  }

  const handleFinishEdit = () => {
    if (!analysisResult) return
    const updatedFoods = analysisResult.foods.map(food => ({
      ...food,
      name: editedFoods[food.name]?.name || food.name,
      quantity: editedFoods[food.name]?.quantity || food.quantity
    }))
    setAnalysisResult({
      ...analysisResult,
      foods: updatedFoods
    })
    setIsEditing(false)
    setSelectedFoods(new Set())
    setEditedFoods({})
  }

  const handleDateSelect = (date: dayjs.Dayjs | null) => {
    if (date) {
      setMealDate(date)
      handleClose()
    }
  }

  // 处理图片显示
  const getImageSource = (input: string) => {
    if (input.startsWith('data:image')) {
      // 这是base64格式的图片数据（iOS）
      return input;
    } else if (input.startsWith('blob:')) {
      // 这是Blob URL（安卓）
      return input;
    }
    // 其他情况（文字输入）
    return null;
  };

  return (
    <div className="analysis-page">
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
      </div>

      <div className="chat-container">
        <div className="user-message">
          {imageData && getImageSource(imageData) ? (
            <img 
              src={getImageSource(imageData)} 
              alt="拍摄的照片" 
              style={{ 
                maxWidth: '100%', 
                borderRadius: '8px' 
              }} 
            />
          ) : (
            <p className="message-text">
              {decodeURIComponent(imageData || '')}
            </p>
          )}
        </div>

        {analysisState === 'loading' ? (
          <div className="system-message">
            {steps.map((step, index) => (
              <div key={index} className={`step-item ${step.status}`}>
                {step.status === 'processing' ? (
                  <CircularProgress size={20} className="step-icon" />
                ) : step.status === 'done' ? (
                  <span className="step-icon done">✓</span>
                ) : (
                  <span className="step-icon">○</span>
                )}
                <span className="step-text">{step.text}</span>
              </div>
            ))}
          </div>
        ) : analysisResult && (
          <div className="system-message">
            <p className="result-hint">已为你记录，请检查一下</p>
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-header-main">
                  <div className="meal-title-container">
                    <div 
                      className="meal-title clickable"
                      onClick={handleMealHeaderClick}
                    >
                      <h2>{formatDisplayDate(mealDate)}</h2>
                      <span className="meal-type">{mealType}</span>
                      <span className="meal-title-arrow">›</span>
                    </div>
                  </div>
                  {isEditing && (
                    <button className="finish-edit-button" onClick={handleFinishEdit}>
                      完成
                    </button>
                  )}
                </div>
              </div>

              {/* 选择菜单 */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  className: "date-menu-paper"
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar 
                    value={mealDate}
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
                <div className="meal-type-selector">
                  {MEAL_TYPES.map(type => (
                    <button
                      key={type}
                      className={`meal-type-button ${type === mealType ? 'active' : ''}`}
                      onClick={() => handleMealTypeSelect(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </Menu>

              <div className="food-list">
                {analysisResult.foods.map((food) => (
                  <div key={food.name} className="food-item">
                    {isEditing && (
                      <div 
                        className={`food-selector ${selectedFoods.has(food.name) ? 'selected' : ''}`}
                        onClick={() => handleFoodSelect(food.name)}
                      >
                        {selectedFoods.has(food.name) && <span>✓</span>}
                      </div>
                    )}
                    <div className="food-emoji">
                      {getFoodEmoji(food.name)}
                    </div>
                    <div className="food-info">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editedFoods[food.name]?.name || food.name}
                            onChange={(e) => handleFoodEdit(food.name, 'name', e.target.value)}
                            className="food-edit-input name"
                          />
                          <input
                            type="text"
                            value={editedFoods[food.name]?.quantity || food.quantity}
                            onChange={(e) => handleFoodEdit(food.name, 'quantity', e.target.value)}
                            className="food-edit-input quantity"
                          />
                        </>
                      ) : (
                        <>
                          <h3>{food.name}</h3>
                          <span className="food-quantity">
                            {food.quantity}{food.weight ? `(约${food.weight})` : ''}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="food-calories">
                      {food.calories} kcal
                    </div>
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button className="edit-action-button add" onClick={handleAddFood}>
                    添加
                  </button>
                  <button 
                    className="edit-action-button delete"
                    onClick={handleDeleteSelected}
                    disabled={selectedFoods.size === 0}
                  >
                    删除
                  </button>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="action-buttons">
                <button className="action-button" onClick={handleEditClick}>编辑</button>
                <button className="action-button feedback">热量不准?</button>
              </div>
            )}
          </div>
        )}
      </div>

      {analysisState === 'done' && analysisResult && (
        <button 
          className={`floating-save-button ${saveStatus === 'saving' ? 'saving' : ''}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? '保存中...' : '保存'}
        </button>
      )}

      <Snackbar 
        open={saveStatus === 'success' || saveStatus === 'error'} 
        autoHideDuration={2000}
        onClose={() => setSaveStatus('idle')}
      >
        <Alert 
          severity={saveStatus === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {saveStatus === 'success' ? '保存成功' : '保存失败'}
        </Alert>
      </Snackbar>
    </div>
  )
} 