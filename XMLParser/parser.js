const fs = require('fs');
const XLSX = require('xlsx')

const excelFile = 'rasp_2s_24-25.xlsx';
const workbook = XLSX.readFile(excelFile);

// Получение первого листа
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonDataR =XLSX.utils.sheet_to_json(worksheet, { raw: false });

// Сохранение JSON в файл
fs.writeFileSync('temp.json', JSON.stringify(jsonDataR, null, 2));

const daysMap = {
    "Понедельник": "Monday",
    "Вторник": "Tuesday",
    "Среда": "Wednesday",
    "Четверг": "Thursday",
    "Пятница": "Friday",
    "Суббота": "Saturday"
};

function parseSchedule(inputData) {
    const groups = new Map();
    let currentDay = "";
    let currentGroup = "";
    let isNumerator = true;

    // Пропускаем последний элемент (дублирующий заголовок)
    const data = inputData.slice(0, -1);

    data.forEach((entry, index) => {
        // Определяем день недели
        if (entry.__EMPTY) {
            currentDay = daysMap[entry.__EMPTY] || entry.__EMPTY;
            isNumerator = true; // Сбрасываем флаг при новом дне
            return;
        }

        // Парсим номер пары и время
        const pairInfo = entry.__EMPTY_1?.split('\r\n') || [];
        const [romanNum, timeRange] = pairInfo;
        const [startTime, endTime] = timeRange?.split('-') || [];

        // Обрабатываем каждую группу
        Object.entries(entry).forEach(([key, value]) => {
            if (key.startsWith('МК') || key.startsWith('ИУК')) {
                currentGroup = key
                    .replace(/Б$/, "B")
                    .replace(/ИУК/g, "IUK")
                    .replace(/МК/g, "MK");

                if (!groups.has(currentGroup)) {
                    groups.set(currentGroup, {
                        group: currentGroup,
                        name: key,
                        gSchedule: {
                            numerator: [],
                            denominator: []
                        }
                    });
                }

                const group = groups.get(currentGroup);
                const weekType = isNumerator ? 'numerator' : 'denominator';

                if (value && value.trim()) {
                    const daySchedule = group.gSchedule[weekType].find(d => d.weekDay === currentDay);
                    const pairData = {
                        pairNum: romanNum?.trim() || "",
                        data: value,
                        startTime: startTime?.trim(),
                        endTime: endTime?.trim()
                    };

                    if (daySchedule) {
                        daySchedule.pairs.push(pairData);
                    } else {
                        group.gSchedule[weekType].push({
                            weekDay: currentDay,
                            pairs: [pairData]
                        });
                    }
                }
            }
        });

        // Переключаем тип недели после обработки строки
        isNumerator = !isNumerator;
    });

    // Сортируем пары по времени
    groups.forEach(group => {
        ['numerator', 'denominator'].forEach(type => {
            group.gSchedule[type].forEach(day => {
                day.pairs.sort((a, b) => 
                    a.startTime.localeCompare(b.startTime)
                );
            });
        });
    });

    return Array.from(groups.values());
}

// Использование
const inputData = JSON.parse(fs.readFileSync('temp.json', 'utf8'));
const output = parseSchedule(inputData);
fs.writeFileSync('output.json', JSON.stringify(output, null, 2));