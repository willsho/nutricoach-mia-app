import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  "一个苹果",
  // 可以添加更多常用食物...
];

interface LocationState {
  selectedFoods?: string[];
  currentInput?: string;
}

export default function CommonFoodsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [selectedFoods, setSelectedFoods] = useState<string[]>(
    state?.selectedFoods || []
  );

  const handleConfirm = () => {
    const currentInput = state?.currentInput || '';
    const newFoods = selectedFoods.filter(
      food => !currentInput.includes(food)
    );
    
    let newInput = currentInput;
    if (newFoods.length > 0) {
      const separator = currentInput ? '、' : '';
      newInput = `${currentInput}${separator}${newFoods.join('、')}`;
    }

    navigate('/', {
      state: { 
        updatedInput: newInput,
        openDrawer: true 
      }
    });
  };

  const handleBack = () => {
    navigate('/', {
      state: { 
        openDrawer: true 
      }
    });
  };

  return (
    <div className="common-foods-page">
      <div className="page-header">
        <button 
          className="back-button"
          onClick={handleBack}
          aria-label="返回"
        >
          <svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L2 10.5L10 19" stroke="#333333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>我常吃的食物</h1>
        <button 
          className="confirm-button"
          onClick={handleConfirm}
          disabled={selectedFoods.length === 0}
        >
          添加
        </button>
      </div>

      <div className="common-foods-grid">
        {COMMON_FOODS.map((food) => (
          <button
            key={food}
            className={`common-food-item ${selectedFoods.includes(food) ? 'selected' : ''}`}
            onClick={() => {
              if (selectedFoods.includes(food)) {
                setSelectedFoods(selectedFoods.filter(f => f !== food));
              } else {
                setSelectedFoods([...selectedFoods, food]);
              }
            }}
          >
            {food}
          </button>
        ))}
      </div>
    </div>
  );
} 