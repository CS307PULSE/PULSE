export function formatDate(inputDate) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [year, month, day] = inputDate.split('-');
    const monthName = months[parseInt(month) - 1];
    const formattedDate = `${monthName} ${parseInt(day)}, ${year}`;
    return formattedDate;
}