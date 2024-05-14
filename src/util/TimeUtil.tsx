export default {
  sleep(milliseconds: number): Promise<any> {
    return new Promise((res) => setTimeout(() => res(undefined), milliseconds));
  },
  getDateAsString(date: Date) {
    if (!date || isNaN(date.getDate())) {
      return 'XX.XX.XXXX - XX:XX';
    }

    return (
      ('0' + date.getDate()).slice(-2) +
      '.' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '.' +
      date.getFullYear() +
      ' ' +
      ('0' + date.getHours()).slice(-2) +
      ':' +
      ('0' + date.getMinutes()).slice(-2) +
      ' Uhr'
    );
  }
};
