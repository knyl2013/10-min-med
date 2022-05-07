export const getYesterdayOf = (d) => {
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d;
};
export const getYesterday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d;
};
export const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const getConsecutiveDays = (days) => {
  if (!days || !days.length) return 0;
  const daysObj = JSON.parse(days);
  if (!daysObj || !daysObj.length) return false;
  const n = daysObj.length;
  let ans = isTodayDone(days) ? 1 : 0;
  let target = getYesterday();
  var set = new Set();
  for (const day of daysObj) {
    set.add(day);
  }
  for (let i = 0; i < n; i++) {
    if (set.has(target.toString())) {
      ans++;
      target = getYesterdayOf(target);
    } else break;
  }
  return ans;
};
export const isTodayDone = (days) => {
  if (!days || !days.length) return false;
  const daysObj = JSON.parse(days);
  if (!daysObj || !daysObj.length) return false;
  const todayStr = getToday().toString();
  for (const day of daysObj) {
    if (day == todayStr) return true;
  }
  return false;
};
