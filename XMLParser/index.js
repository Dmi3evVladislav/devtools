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

// Загрузка JSON файла
const jsonData = JSON.parse(fs.readFileSync('temp.json', 'utf8'));

// Функция для преобразования JSON в нужный формат
function parseSchedule(jsonData) {
    const schedule = [];
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let currentDay = "";
    let currentPairNum = 0;
    let currentStartTime = "";
    let currentEndTime = "";

    jsonData.forEach((entry, index) => {
        // Определяем текущий день недели
        if (entry.__EMPTY) {
            currentDay = entry.__EMPTY;
        }
        console.log(entry);
        

        // Определяем номер пары и время
        if (entry.__EMPTY_1) {
            const pairInfo = entry.__EMPTY_1.split('\r\n');
            currentPairNum = parseInt(pairInfo[0]);
            const timeRange = pairInfo[1].split('-');
            currentStartTime = timeRange[0];
            currentEndTime = timeRange[1];
        }

        // Обрабатываем каждую группу
        Object.keys(entry).forEach(key => {
            if (key.startsWith('МК') || key.startsWith('ИУК')) {
                const group = key;
                const pairInfo = entry[key];
                // console.log(pairInfo);
                // console.log("///");
                
                

                // Разделяем название пары, преподавателей и аудитории
                const [name, ...rest] = pairInfo.split(' ');
                const teacherAuditorium = rest.join(' ');
                

                // Разделяем преподавателей и аудитории
                const teacherAuditoriumParts = teacherAuditorium.split(' ');
                const teachers = [];
                const auditoriums = [];
                let isAuditorium = false;

                teacherAuditoriumParts.forEach(part => {
                    if (part.startsWith('УАК') || part.startsWith('УЛК') || part.startsWith('к.')) {
                        isAuditorium = true;
                        auditoriums.push(part);
                    } else if (!isAuditorium) {
                        teachers.push(part);
                    }
                });

                // Если аудитория не указана, оставляем пустую строку
                const auditorium = auditoriums.length > 0 ? auditoriums.join(', ') : '';

                // Находим или создаем расписание для группы
                let groupSchedule = schedule.find(s => s.group === group);
                if (!groupSchedule) {
                    groupSchedule = {
                        group: group,
                        name: group,
                        gSchedule: {
                            numerator: [],
                            denominator: []
                        }
                    };
                    schedule.push(groupSchedule);
                }

                // Создаем объект пары
                const pair = {
                    pairNum: currentPairNum,
                    name: name,
                    teacher: teachers.join(', '), // Объединяем преподавателей через запятую
                    startTime: currentStartTime,
                    endTime: currentEndTime,
                    auditorium: auditorium
                };

                // Определяем день недели
                const weekDayIndex = daysOfWeek.indexOf(currentDay);
                if (weekDayIndex !== -1) {
                    const weekDay = daysOfWeek[weekDayIndex];

                    // Определяем, числитель это или знаменатель
                    const isDenominator = index % 2 === 1; // Если индекс нечетный, это знаменатель
                    const scheduleType = isDenominator ? 'denominator' : 'numerator';

                    // Находим или создаем день в расписании
                    const daySchedule = groupSchedule.gSchedule[scheduleType].find(d => d.weekDay === weekDay);
                    if (daySchedule) {
                        daySchedule.pairs.push(pair);
                    } else {
                        groupSchedule.gSchedule[scheduleType].push({
                            weekDay: weekDay,
                            pairs: [pair]
                        });
                    }
                }
            }
        });
    });

    return schedule;
}

const parsedSchedule = parseSchedule(jsonData);
fs.writeFileSync('output.json', JSON.stringify(parsedSchedule, null, 2));
console.log('Расписание успешно сохранено в output.json');