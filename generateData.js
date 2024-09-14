const fs = require('fs');

function generateCSV() {
    const rows = [];
    let timeInSeconds = 0;
    
    for (let i = 0; i < 100; i++) {
        const randomNumber = Math.floor(Math.random() * 30) + 1;
        const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(timeInSeconds % 60).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        rows.push(`${randomNumber},${time}`);
        timeInSeconds += 5;
    }

    const csvContent = 'Shakiness,Time\n' + rows.join('\n');
    fs.writeFileSync('data.csv', csvContent);
}

generateCSV();
