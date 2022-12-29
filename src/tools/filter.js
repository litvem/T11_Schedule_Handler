const REG = /(\d{1,2})(?=\:)/g;
const REG_SORTING = /(\d{1,2})(?=\:)/;
const REG_BREAKES = /(\d{1,2}:\d{1,2})/g;
const DAY = 1000 * 60 * 60 * 24; //day in milliseconds
const BREAKES = 2;
const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function generateSchedule(dentists, bookings, interval) {
  var intervalLength = (interval.to - interval.from) / DAY;
  var generalSchedule = [];

  for (let j = 0; j < intervalLength; j++) {
    var schedule = new Map();
    var date = new Date(interval.from.getTime() + j * DAY);

    dentists.forEach((dentist) => {
      pushDentistAvailableSlots(schedule, dentist, bookings, date);
    });

    const stringDate = getStringDate(date);
    const unsortedSchedule = Object.fromEntries(schedule);

    const sortedSchedule = sortTimeSlots(unsortedSchedule);

    generalSchedule.push({
      date: stringDate,
      schedule: sortedSchedule,
    });
  }

  return generalSchedule;
}

// idea for sorting the object keys source: https://bobbyhadz.com/blog/javascript-sort-object-keys
function sortTimeSlots(unsortedSchedule) {
  const sortedSchedule = Object.keys(unsortedSchedule)
    .sort((first, second) => {
      const a = first.match(REG_SORTING)[0];
      const b = second.match(REG_SORTING)[0];
      return a - b;
    })
    .reduce((sorted, key) => {
      sorted[key] = unsortedSchedule[key];
      return sorted;
    }, {});

  return sortedSchedule;
}

function pushDentistAvailableSlots(schedule, dentist, bookings, date) {
  var openinghours = dentist.openinghours[WEEK_DAYS[date.getDay()]];

  if (dentist.breaks.coffee && dentist.breaks.lunch) {
    var coffeeBreak = dentist.breaks.coffee;
    var [lunchBreakFirstHalf, lunchBreakSecondHalf] = getLunchBreakes(dentist.breaks.lunch)
  }

  if (openinghours) {
    var [open, close] = openinghours.match(REG);
    open = parseInt(open, 10);
    close = parseInt(close, 10);

    for (var i = 0; i < close - open; i++) {
      var time = `${open + i}:00-${open + i}:30`;
      var timeHalf = `${open + i}:30-${open + i + 1}:00`;

      var alreadyTaken = 0;
      var alreadyTakenHalf = 0;

      bookings.map((booking) => {
        if (
          String(booking.dentistid) === String(dentist._id) &&
          booking.date.getTime() == date.getTime() &&
          booking.time == time
        ) {
          alreadyTaken += 1;
        }

        if (
          String(booking.dentistid) === String(dentist._id) &&
          booking.date.getTime() == date.getTime() &&
          booking.time == timeHalf
        ) {
          alreadyTakenHalf += 1;
        }
      });

      var entry = {
        dentist: dentist.id,
        slots: dentist.dentists - alreadyTaken,
      };

      var entryHalf = {
        dentist: dentist.id,
        slots: dentist.dentists - alreadyTakenHalf,
      };

      if (
        time != coffeeBreak &&
        time != lunchBreakFirstHalf &&
        time != lunchBreakSecondHalf
      ) {
        if (schedule.has(time)) {
          schedule.get(time).push(entry);
        } else {
          schedule.set(time, [entry]);
        }
      }


      if (
        timeHalf != coffeeBreak &&
        timeHalf != lunchBreakFirstHalf &&
        timeHalf != lunchBreakSecondHalf
      ) {
        if (schedule.has(timeHalf)) {
          schedule.get(timeHalf).push(entryHalf);
        } else {
          schedule.set(timeHalf, [entryHalf]);
        }
      }
    }
  }
}

/**
 * reference: https://bobbyhadz.com/blog/javascript-format-date-yyyymmdd
 * @param {Date} date 
 * @returns String of the date in the yyyy-mm-dd format
 */

function getStringDate(date) {
  // getMonth() returns a zero base value, January is 0, so we need to add 1 one to provide the correct date. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth
  let month = date.getMonth() + 1
  let day = date.getDate()

  //ensures that month and day will have 2 digits
  let formatedMonth = month.toString().padStart(2, 0)
  let formatedDay = day.toString().padStart(2,0)

  return `${date.getFullYear()}-${formatedMonth}-${formatedDay}`;
}

function getLunchBreakes(lunchBreak) {
  var [lunchBreakFirstHalf, lunchBreakSecondHalf] = lunchBreak.match(REG_BREAKES);

    if (lunchBreakFirstHalf.charAt(3) == 0) {
      lunchBreakSecondHalf =
        lunchBreakFirstHalf.substring(0, 3) + "30" + "-" + lunchBreakSecondHalf;
      lunchBreakFirstHalf =
        lunchBreakFirstHalf + "-" + lunchBreakFirstHalf.substring(0, 3) + "30";
    } else {
      lunchBreakFirstHalf =
        lunchBreakFirstHalf + "-" + lunchBreakSecondHalf.substring(0, 3) + "00";
      lunchBreakSecondHalf =
        lunchBreakSecondHalf.substring(0, 3) +
        "00" +
        "-" +
        lunchBreakSecondHalf;
    }

    return [lunchBreakFirstHalf, lunchBreakSecondHalf]
}

module.exports = { generateSchedule };
