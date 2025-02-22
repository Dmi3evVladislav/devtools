const fs = require('fs');
const XLSX = require('xlsx')

const excelFile = 'rasp_2s_24-25.xlsx';
const workbook = XLSX.readFile(excelFile);

// Получение первого листа
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }
  
const columns = transpose(rows);
fs.writeFileSync('temp.json', JSON.stringify(columns, null, 2));

function countPairs(schedule) {
  const pairsCount = [];
  let count = 0;

  for (let i = 1; i < schedule.length; i++) {
      if (schedule[i] !== null) {
          count++;
      } else {
          // Если встретили null, значит день закончился
          if (count > 0) {
              pairsCount.push(count);
              count = 0; // Сбросить счетчик для следующего дня
          }
      }
  }

  // Добавить последний день, если он не закончился на null
  if (count > 0) {
      pairsCount.push(count);
  }

  return pairsCount;
}

function countPairsPerDay(schedule) {
  const days = [];
  let currentDayCount = 0;
  let previousElement = null;
  let metTwoNulls = false;

  for (const element of schedule) {
      if (metTwoNulls) break;

      if (element === null) {
          if (previousElement === null) {
              metTwoNulls = true;
              break;
          }
          previousElement = null;
          continue;
      }

      if (typeof element === 'string') {
          if (element.startsWith('I\r\n')) {
              if (currentDayCount > 0) {
                  days.push(currentDayCount);
                  currentDayCount = 0;
              }
              currentDayCount++;
          } else if (/^[IVXLCDM]+\r\n/.test(element)) {
              currentDayCount++;
          }
      }

      previousElement = element;
  }

  if (currentDayCount > 0 && !metTwoNulls) {
      days.push(currentDayCount);
  }

  return days;
}

const pairsInDay = countPairsPerDay(columns[1])
console.log(pairsInDay);


function transliterateGroupName(groupName) {
  const cyrillicToLatin = {
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
      'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
      'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
      'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
      'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
      'Ш': 'Sh', 'Щ': 'Shch', 'Ы': 'Y', 'Э': 'E', 'Ю': 'Yu',
      'Я': 'Ya',
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
      'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
      'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
      'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
      'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
      'ш': 'sh', 'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'yu',
      'я': 'ya'
  };
  
  return groupName.split('').map(c => cyrillicToLatin[c] || c).join('');
}

function processSchedule(scheduleArray, daysPairs) {
  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const groupName = scheduleArray[0]
  
  let schedule = [];
  let currentIndex = 0;
  
  daysPairs.forEach((pairsCount, dayIndex) => {
      const daySchedule = {
          day: daysOfWeek[dayIndex],
          nominator: [],
          denominator: []
      };
      
      const elementsForDay = scheduleArray.slice(currentIndex+1, currentIndex+1 + pairsCount * 2);
      currentIndex += pairsCount * 2;
      
      for(let pairNum = 1; pairNum <= pairsCount; pairNum++) {
          const idx = (pairNum - 1) * 2;
          const first = elementsForDay[idx];
          const second = elementsForDay[idx + 1];
          
          const processPair = (source, target) => {
              if (typeof source === 'string' && source !== 'empty') {
                  target.push({
                      pairNum: pairNum,
                      pair: source
                  });
              }
          };
          
          // Обработка 5 случаев
          if (first !== 'empty' && first !== null) {
              processPair(first, daySchedule.nominator);
          }
          if (second !== 'empty' && second !== null) {
              processPair(second, daySchedule.denominator);
          }
          if (first !== null && second == null) {
            processPair(first, daySchedule.nominator);
            processPair(first, daySchedule.denominator);
          }
      }
      
      schedule.push(daySchedule);
  });
  
  return {
      name: groupName,
      group: transliterateGroupName(groupName),
      schedule: schedule
  };
}

const result = processSchedule(columns[2], pairsInDay);
console.log(JSON.stringify(result, null, 2));
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));


// // Сохранение JSON в файл
// // fs.writeFileSync('temp.json', JSON.stringify(jsonDataR, null, 2));

// // Загрузка JSON файла
// const jsonData = JSON.parse(fs.readFileSync('temp.json', 'utf8'));

// jsonData.forEach((entry, index) => {
//         Object.keys(entry).forEach((key, keyindex) => {
//         console.log(`${index}:${keyindex} | ${key} : ${entry[key]};`);

//         let objsCounter = 0

//         if(key == "__EMPTY"){
//             ob
//         }
//     })
// })

// const createDay = (dayData) => {

// }

// // Функция для преобразования JSON в нужный формат
// function parseSchedule(jsonData) {
//     const schedule = [];
//     const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     let currentDay = "";
//     let currentPairNum = 0;
//     let currentStartTime = "";
//     let currentEndTime = "";

//     jsonData.forEach((entry, index) => {
//         if (entry.__EMPTY) {
//             currentDay = entry.__EMPTY;
//         }
//         if (entry.__EMPTY_1) {
//             const pairInfo = entry.__EMPTY_1.split('\r\n');
//             currentPairNum = parseInt(pairInfo[0]);
//             const timeRange = pairInfo[1].split('-');
//             currentStartTime = timeRange[0];
//             currentEndTime = timeRange[1];
//         }

//         Object.keys(entry).forEach(key => {
//             if (key.startsWith('МК') || key.startsWith('ИУК')) {
//                 const group = key;
//                 console.log(group);
                
//                 const pairInfo = entry[key];
//                 console.log(pairInfo);

//                 const [name, teacherAuditorium] = pairInfo.split(' ');
//                 const [teacher, auditorium] = teacherAuditorium.split(' ');

//                 let groupSchedule = schedule.find(s => s.group === group);
//                 if (!groupSchedule) {
//                     groupSchedule = {
//                         group: group,
//                         name: group,
//                         gSchedule: {
//                             numerator: [],
//                             denominator: []
//                         }
//                     };
//                     schedule.push(groupSchedule);
//                 }

//                 const pair = {
//                     pairNum: currentPairNum,
//                     name: name,
//                     teacher: teacher,
//                     startTime: currentStartTime,
//                     endTime: currentEndTime,
//                     auditorium: auditorium
//                 };

//                 const weekDayIndex = daysOfWeek.indexOf(currentDay);
//                 if (weekDayIndex !== -1) {
//                     const weekDay = daysOfWeek[weekDayIndex];
//                     const daySchedule = groupSchedule.gSchedule.numerator.find(d => d.weekDay === weekDay);
//                     if (daySchedule) {
//                         daySchedule.pairs.push(pair);
//                     } else {
//                         groupSchedule.gSchedule.numerator.push({
//                             weekDay: weekDay,
//                             pairs: [pair]
//                         });
//                     }
//                 }
//             }
//         });
//     });

//     return schedule;
// }

// const parsedSchedule = parseSchedule(jsonData);

// fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));
// console.log(JSON.stringify(parsedSchedule, null, 2));