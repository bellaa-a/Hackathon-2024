let timerInterval;
let seconds = 0;
let sessionChart;

// Initialize the app to show the sign-in page
document.addEventListener('DOMContentLoaded', () => {
    showPage('page1');
});

// Function to show a specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

// Function to handle sign-in
function signIn() {
    showPage('page2');
}

// Function to view old sessions
function viewOldSessions() {
    showPage('page3');

    // Ensure session buttons have click handlers
    document.querySelectorAll('.session-button').forEach(button => {
        button.onclick = () => onSessionButtonClick(button.textContent);
    });
}

// Function to start a new session
function startNewSession() {
    showPage('page4');
}

// Function to go back to the previous page
function goBack() {
    const currentPage = document.querySelector('.page:not([style*="display: none"])');
    if (currentPage.id === 'page4') {
        resetTimer();
        showPage('page2');
    } else if (currentPage.id === 'page3') {
        showPage('page2');
    } else if (currentPage.id === 'page2') {
        showPage('page1'); // Go back to Sign In page from Welcome page
    } else if (currentPage.id === 'sessionDetails') {
        showPage('page3'); // Go back to Old Sessions page from session details
    }
}

// Function to start the timer
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            seconds++;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            document.getElementById('timer').textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(secs)}`;
        }, 1000);
    }
}

// Function to stop the timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Function to reset the timer
function resetTimer() {
    seconds = 0;
    document.getElementById('timer').textContent = '00:00:00';
    stopTimer();
}

// Function to format time
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Function to show session details
function showSessionDetails(sessionData) {
    showPage('sessionDetails');

    // Update the session details
    document.getElementById('numberOfShakes').textContent = `Number of shake(s): ${sessionData.numberOfShakes}`;
    document.getElementById('averageTime').textContent = `Average time of shakes: ${sessionData.averageTime}`;
    document.getElementById('totalTime').textContent = `Total time of shakes: ${sessionData.totalTime}`;

    // Update the chart
    if (sessionChart) {
        sessionChart.destroy();
    }

    const ctx = document.getElementById('sessionChart').getContext('2d');

    // Chart.js plugin to draw a horizontal line
    const horizontalLinePlugin = {
        id: 'horizontalLine',
        beforeDraw: (chart, args, options) => {
            const { ctx, chartArea } = chart;
            const { top, bottom } = chartArea;
            const y = chart.scales.y.getPixelForValue(27); // Y value for the line

            ctx.save();
            ctx.strokeStyle = 'red'; // Line color
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.stroke();
            ctx.restore();
        }
    };

    sessionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sessionData.labels,
            datasets: [{
                label: 'Variance',
                data: sessionData.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                horizontalLine: {
                    // You can add more options here if needed
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        },
        plugins: [horizontalLinePlugin] // Add the plugin here
    });
}

// Function to fetch and parse CSV data
async function fetchCSVData(filename) {
    const response = await fetch(filename); // Use the filename passed in
    const text = await response.text();
    const rows = text.split('\n').slice(1); // Skip the header row if there's one

    const labels = [];
    const data = [];
    let totalSeconds = 0;

    rows.forEach(row => {
        const columns = row.split(',');
        if (columns.length === 2) {
            labels.push(columns[1].trim()); // Time stamps
            const number = parseFloat(columns[0].trim()); // Random numbers
            data.push(number);

            // Convert time to seconds and add to total time
            const [hours, minutes, seconds] = columns[1].trim().split(':').map(Number);
            totalSeconds += (hours * 3600) + (minutes * 60) + seconds;
        }
    });

    // For simplicity, we'll return hardcoded values for the number of shakes and average times
    const numberOfShakes = 8;
    const averageTime = '00:00:49';
    const totalTime = '00:01:00';

    return {
        numberOfShakes,
        averageTime,
        totalTime,
        labels,
        data
    };
}


// Function to handle session button clicks
async function onSessionButtonClick(sessionName) {
    let filename;

    switch (sessionName) {
        case 'Stable Session':
            filename = 'stableData.csv';
            break;
        case 'Shake Session':
            filename = 'shakeData.csv';
            break;
        case 'Reach Session':
            filename = 'reachData.csv';
            break;
        case 'Session-4':
            filename = 'data.csv';
            break;
        default:
            console.error('Unknown session:', sessionName);
            return;
    }

    const sessionData = await fetchCSVData(filename);
    showSessionDetails(sessionData);
}