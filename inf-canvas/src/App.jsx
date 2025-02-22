import React, { useState } from 'react';
import InfiniteCanvas from './Canvas';
import Toolbar from './Toolbar';

const App = () => {
  const [tool, setTool] = useState('hand'); // По умолчанию выбран инструмент "Рука"
  const [lineColor, setLineColor] = useState('#000000'); // Цвет линии
  const [lineWidth, setLineWidth] = useState(2); // Толщина линии
  const [lineStyle, setLineStyle] = useState('solid'); // Стиль линии

  return (
    <div>
      <Toolbar
        onToolChange={setTool}
        currentTool={tool}
        onColorChange={setLineColor}
        onWidthChange={setLineWidth}
        onStyleChange={setLineStyle}
      />
      <InfiniteCanvas
        tool={tool}
        lineColor={lineColor}
        lineWidth={lineWidth}
        lineStyle={lineStyle}
      />
    </div>
  );
};

export default App;