export default function makeDate() {
  const date = new Date().getDate().toString(); //Current Date
  const month = (new Date().getMonth() + 1).toString(); //Current Month
  const year = new Date().getFullYear().toString(); //Current Year
  const hours = new Date().getHours().toString(); //Current Hours
  const min = new Date().getMinutes().toString(); //Current Minutes
  const sec = new Date().getSeconds().toString(); //Current Seconds

  return month + date + year + hours + min + sec;
}
