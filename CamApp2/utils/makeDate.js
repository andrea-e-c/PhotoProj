export default function makeDate() {
  const date =
    new Date().getDate().toString().length === 2
      ? new Date().getDate().toString()
      : '0' + new Date().getDate().toString(); //Current Date, adds 0 to single digit days
  const month =
    (new Date().getMonth() + 1).toString().length === 2
      ? (new Date().getMonth() + 1).toString()
      : '0' + (new Date().getMonth() + 1).toString(); //Current Month, adds 0 to single digit months
  const year = new Date().getFullYear().toString(); //Current Year
  const hours =
    new Date().getHours().toString().length === 2
      ? new Date().getHours().toString()
      : '0' + new Date().getHours().toString(); //Current Hours
  const min =
    new Date().getMinutes().toString().length === 2
      ? new Date().getMinutes().toString()
      : '0' + new Date().getMinutes().toString(); //Current Minutes
  const sec =
    new Date().getSeconds().toString().length === 2
      ? new Date().getSeconds().toString()
      : '0' + new Date().getSeconds().toString(); //Current Seconds

  return year + month + date + hours + min + sec;
}
