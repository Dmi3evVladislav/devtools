const fs = require('fs');
const XLSX = require('xlsx')

const excelFile = 'rasp_2s_24-25.xlsx';
const workbook = XLSX.readFile(excelFile);

// Получение первого листа

function countPairsPerDay(schedule) {
  const days = [];
  let currentDayCount = 0;
  let previousElement = null;
  let metTwoNulls = false;
  

  for (let element of schedule) {
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
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
                let startTime
                let endTime
                switch (pairNum) {
                  case 1:
                    startTime = "8:30"
                    endTime = "10:05"
                    break;
                  case 2:
                    startTime = "10:20"
                    endTime = "11:55"
                    break;
                  case 3:
                    startTime = "12:10"
                    endTime = "13:45"
                    break;
                  case 4:
                    startTime = "14:15"
                    endTime = "15:50"
                    break;
                  case 5:
                      startTime = "16:05"
                      endTime = "17:40"
                      break;
                  case 6:
                      startTime = "17:50"
                      endTime = "19:25"
                      break;
                  case 7:
                      startTime = "19:35"
                      endTime = "21:10"
                      break;
                  default:
                    break;
                }
                  target.push({
                      pairNum: pairNum,
                      pair: source,
                      startTime: startTime,
                      endTime: endTime
                  });
              }
          };
          
          // Обработка 5 случаев
          if (first !== 'empty' && first !== null) {
              if (first !== null && second == null) {
                processPair(first, daySchedule.nominator);
                processPair(first, daySchedule.denominator);
              }
              else {
                processPair(first, daySchedule.nominator);
              }
          }
          if (second !== 'empty' && second !== null) {
              processPair(second, daySchedule.denominator);
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

function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

let output = []

const sheetNames = workbook.SheetNames // Массив с курсами (имена листов)
// console.log(sheetNames);

sheetNames.forEach((worksheetName, sheetNum) => {
  console.log(worksheetName);
  
  const worksheet = workbook.Sheets[worksheetName]; // Лист курса
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Строки

  // console.log(rows);
  

  let columns = transpose(rows);
  // console.log(JSON.stringify(columns, null, 2));
  

  const pairsInDay = countPairsPerDay(columns[1])
  let outputSheet = []

  for(let i = 2; i < columns.length-2; i++){
    const result = processSchedule(columns[i], pairsInDay);
      outputSheet.push({
      group: result.group,
      data: result
    })
  }

  output.push({
    course: worksheetName,
    groups: outputSheet
  })
})
  
// fs.writeFileSync('temp.json', JSON.stringify(columns, null, 2));




fs.writeFileSync('output.json', JSON.stringify(output, null, 2));


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