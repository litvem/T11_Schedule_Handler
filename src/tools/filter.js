const REG = /(\d{1,2})(?=\:)/g;
const REG_SORTING = /(\d{1,2})(?=\:)/;
const DAY = 1000 * 60 * 60 * 24; //day in milliseconds
const BREAKES = 2;
const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wenesday",
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

    const stringDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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
          booking.time == time
        ) {
          alreadyTaken += 1;
        }

        if (booking.dentistsid == dentist.id && booking.time == timeHalf) {
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

      if (schedule.has(time)) {
        schedule.get(time).push(entry);
      } else {
        schedule.set(time, [entry]);
      }

      if (schedule.has(timeHalf)) {
        schedule.get(timeHalf).push(entryHalf);
      } else {
        schedule.set(timeHalf, [entryHalf]);
      }
    }
  }
}

module.exports = { generateSchedule };
