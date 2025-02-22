import React, { useRef, useEffect, useState } from 'react';

const InfiniteCanvas = ({ tool: propTool, lineColor, lineWidth, lineStyle }) => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [scale, setScale] = useState(1); // Масштаб
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Смещение
  const [isDragging, setIsDragging] = useState(false); // Перемещение
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Начальная позиция при перемещении
  const [tool, setTool] = useState(propTool); // Текущий инструмент
  const [lines, setLines] = useState([]); // Все линии
  const [currentLine, setCurrentLine] = useState(null); // Текущая линия
  const [paths, setPaths] = useState([]); // Все кривые
  const [currentPath, setCurrentPath] = useState([]); // Текущий путь (точки)
  const [isDrawing, setIsDrawing] = useState(false); // Состояние рисования
  const [selectedShape, setSelectedShape] = useState(null); // Выбранная фигура
  const [isEditing, setIsEditing] = useState(false); // Режим редактирования

  // Обновляем внутреннее состояние tool при изменении пропса
  useEffect(() => {
    setTool(propTool);
  }, [propTool]);

  // Инициализация контекста canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
    updateCanvasSize(canvas);
    redraw();

    // Обработчик wheel для масштабирования
    const handleWheel = (event) => {
      event.preventDefault();
      const zoomFactor = 0.1;
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      const newScale = event.deltaY < 0 ? scale * (1 + zoomFactor) : scale / (1 + zoomFactor);
      setScale(newScale);

      setOffset((prevOffset) => ({
        x: prevOffset.x - (mouseX - prevOffset.x) * (newScale / scale - 1),
        y: prevOffset.y - (mouseY - prevOffset.y) * (newScale / scale - 1),
      }));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  // Обновление размеров canvas при изменении размеров окна
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      updateCanvasSize(canvas);
      redraw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scale, offset]);

  // Установка размеров canvas
  const updateCanvasSize = (canvas) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  // Отрисовка сетки
  const drawGrid = () => {
    if (!ctx) return;

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const startX = -offset.x / scale - ctx.canvas.width / scale;
    const startY = -offset.y / scale - ctx.canvas.height / scale;
    const endX = -offset.x / scale + 2 * ctx.canvas.width / scale;
    const endY = -offset.y / scale + 2 * ctx.canvas.height / scale;

    for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Отрисовка всех линий и кривых
  const redraw = () => {
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Отрисовка сетки
    drawGrid();

    // Отрисовка всех линий
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      setLineStyle(ctx, line.style);
      ctx.stroke();
    });

    // Отрисовка всех кривых
    paths.forEach((path) => {
      if (path.points.length < 2) return; // Проверяем, что точек достаточно

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y); // Начинаем с первой точки

      for (let i = 1; i < path.points.length; i++) {
        const prevPoint = path.points[i - 1];
        const currentPoint = path.points[i];
        const controlX = (prevPoint.x + currentPoint.x) / 2;
        const controlY = (prevPoint.y + currentPoint.y) / 2;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
      }

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      setLineStyle(ctx, path.style);
      ctx.stroke();
    });

    // Отрисовка текущей линии (если есть)
    if (currentLine) {
      ctx.beginPath();
      ctx.moveTo(currentLine.startX, currentLine.startY);
      ctx.lineTo(currentLine.endX, currentLine.endY);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      setLineStyle(ctx, lineStyle);
      ctx.stroke();
    }

    // Отрисовка текущего пути (пиксели в реальном времени)
    if (currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);

      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      setLineStyle(ctx, lineStyle);
      ctx.stroke();
    }

    // Отрисовка рамки для выбранной фигуры
    if (selectedShape) {
      ctx.strokeStyle = '#0000FF'; // Синий цвет рамки
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Пунктирная рамка
      ctx.strokeRect(
        selectedShape.x - 5,
        selectedShape.y - 5,
        selectedShape.width + 10,
        selectedShape.height + 10
      );
      ctx.setLineDash([]); // Сброс пунктира
    }

    ctx.restore();
  };

  // Установка стиля линии
  const setLineStyle = (ctx, style) => {
    if (style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (style === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else {
      ctx.setLineDash([]); // Сплошная линия
    }
  };

  // Обработчик начала рисования
  const startDrawing = (event) => {
    if (tool === 'hand' || tool === 'mouse') return; // Не рисуем, если выбран инструмент "Рука" или "Мышь"

    setIsDrawing(true);

    const { offsetX, offsetY } = event.nativeEvent;
    const startX = (offsetX - offset.x) / scale;
    const startY = (offsetY - offset.y) / scale;

    if (tool === 'line') {
      // Начинаем новую линию
      setCurrentLine({ startX, startY, endX: startX, endY: startY, color: lineColor, width: lineWidth, style: lineStyle });
    } else if (tool === 'pencil') {
      // Начинаем новый путь
      setCurrentPath([{ x: startX, y: startY }]);
    }
  };

  // Обработчик рисования
  const handleDrawing = (event) => {
    if (tool === 'hand' || tool === 'mouse' || !isDrawing) return; // Не рисуем, если выбран инструмент "Рука" или "Мышь", или не нажата ЛКМ

    const { offsetX, offsetY } = event.nativeEvent;
    const endX = (offsetX - offset.x) / scale;
    const endY = (offsetY - offset.y) / scale;

    if (tool === 'line' && currentLine) {
      // Обновляем текущую линию
      setCurrentLine((prevLine) => ({
        ...prevLine,
        endX,
        endY,
      }));
    } else if (tool === 'pencil') {
      // Добавляем новую точку в текущий путь
      setCurrentPath((prevPath) => [...prevPath, { x: endX, y: endY }]);
    }

    // Перерисовываем canvas
    redraw();
  };

  // Обработчик завершения рисования
  const stopDrawing = () => {
    if (tool === 'hand' || tool === 'mouse') return; // Не рисуем, если выбран инструмент "Рука" или "Мышь"

    setIsDrawing(false);

    if (tool === 'line' && currentLine) {
      // Сохраняем текущую линию
      setLines((prevLines) => [...prevLines, currentLine]);
      setCurrentLine(null);
    } else if (tool === 'pencil' && currentPath.length > 1) {
      // Сохраняем текущий путь как кривую
      setPaths((prevPaths) => [
        ...prevPaths,
        { points: currentPath, color: lineColor, width: lineWidth, style: lineStyle },
      ]);
      setCurrentPath([]);
    } else {
      // Если точек недостаточно, очищаем currentPath
      setCurrentPath([]);
    }
  };

  // Обработчик выбора фигуры
  const handleShapeSelection = (event) => {
    if (tool !== 'mouse') return; // Выбираем фигуру только если выбран инструмент "Мышь"

    const { offsetX, offsetY } = event.nativeEvent;
    const x = (offsetX - offset.x) / scale;
    const y = (offsetY - offset.y) / scale;

    // Проверяем, была ли выбрана линия
    const selectedLine = lines.find((line) => {
      const minX = Math.min(line.startX, line.endX);
      const maxX = Math.max(line.startX, line.endX);
      const minY = Math.min(line.startY, line.endY);
      const maxY = Math.max(line.startY, line.endY);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });

    if (selectedLine) {
      setSelectedShape({
        type: 'line',
        x: Math.min(selectedLine.startX, selectedLine.endX),
        y: Math.min(selectedLine.startY, selectedLine.endY),
        width: Math.abs(selectedLine.endX - selectedLine.startX),
        height: Math.abs(selectedLine.endY - selectedLine.startY),
        line: selectedLine,
      });
    } else {
      setSelectedShape(null);
    }
  };

  // Обработчик начала перемещения
  const startDragging = (event) => {
    if (tool !== 'hand') return; // Перемещаем только если выбран инструмент "Рука"
    setIsDragging(true);
    setStartPos({
      x: event.nativeEvent.offsetX - offset.x,
      y: event.nativeEvent.offsetY - offset.y,
    });
  };

  // Обработчик перемещения
  const handleDragging = (event) => {
    if (!isDragging) return;
    setOffset({
      x: event.nativeEvent.offsetX - startPos.x,
      y: event.nativeEvent.offsetY - startPos.y,
    });
  };

  // Обработчик завершения перемещения
  const stopDragging = () => {
    setIsDragging(false);
  };

  // Перерисовка при изменении масштаба, смещения, линий или кривых
  useEffect(() => {
    redraw();
  }, [scale, offset, lines, paths, currentLine, currentPath, selectedShape]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={tool === 'hand' ? startDragging : tool === 'mouse' ? handleShapeSelection : startDrawing}
      onMouseMove={tool === 'hand' ? handleDragging : tool === 'mouse' ? null : handleDrawing}
      onMouseUp={tool === 'hand' ? stopDragging : tool === 'mouse' ? null : stopDrawing}
      onMouseLeave={tool === 'hand' ? stopDragging : tool === 'mouse' ? null : stopDrawing}
      style={{
        position: 'fixed',
        top: '40px', // Сдвиг вниз для панели инструментов
        left: 0,
        cursor: tool === 'hand' ? (isDragging ? 'grabbing' : 'grab') : tool === 'mouse' ? 'pointer' : 'crosshair',
        zIndex: 999,
      }}
    />
  );
};

export default InfiniteCanvas;