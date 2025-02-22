import React from 'react';

const Toolbar = ({ onToolChange, currentTool, onColorChange, onWidthChange, onStyleChange, lineColor }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f0f0f0',
        padding: '10px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000,
        borderBottom: '1px solid #ccc',
      }}
    >
      <button
        onClick={() => onToolChange('hand')}
        style={{ backgroundColor: currentTool === 'hand' ? '#ccc' : '#fff' }}
      >
        Рука
      </button>
      <button
        onClick={() => onToolChange('line')}
        style={{ backgroundColor: currentTool === 'line' ? '#ccc' : '#fff' }}
      >
        Линия
      </button>
      <button
        onClick={() => onToolChange('pencil')}
        style={{ backgroundColor: currentTool === 'pencil' ? '#ccc' : '#fff' }}
      >
        Карандаш
      </button>
      <button
        onClick={() => onToolChange('mouse')}
        style={{ backgroundColor: currentTool === 'mouse' ? '#ccc' : '#fff' }}
      >
        Мышь
      </button>

      {/* Выбор цвета */}
      <input
        type="color"
        value={lineColor} // Синхронизируем значение с lineColor
        onChange={(e) => onColorChange(e.target.value)}
      />

      {/* Выбор толщины линии */}
      <select onChange={(e) => onWidthChange(Number(e.target.value))}>
        <option value={1}>1px</option>
        <option value={2}>2px</option>
        <option value={3}>3px</option>
        <option value={5}>5px</option>
        <option value={10}>10px</option>
      </select>

      {/* Выбор стиля линии */}
      <select onChange={(e) => onStyleChange(e.target.value)}>
        <option value="solid">Сплошная</option>
        <option value="dashed">Пунктирная</option>
        <option value="dotted">Точечная</option>
      </select>
    </div>
  );
};

export default Toolbar;