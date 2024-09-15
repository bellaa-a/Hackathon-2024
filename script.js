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
async function signIn() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();
        if (response.ok) {
            // Success - proceed to the welcome page
            showPage('page2');
        } else {
            // Error - show an error message
            alert(result.message); // Shows 'User not found' or 'Incorrect password'
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function CreateAccount(){
    showPage('register');
}

async function register(){
    var regEmail = document.getElementById("newEmail").value;
    var regPassword = document.getElementById("newPassword").value;
    
    // Send data to the backend
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: regEmail,
                password: regPassword
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message); // Success message
        } else {
            alert(result.message); // Error message (e.g., email already taken)
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
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
                label: 'variance',
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
async function fetchCSVData() {
    const response = await fetch('handShakingData.csv'); // Adjust the path to your CSV file if necessary
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

    const numberOfShakes = 8;
    const averageTimeSeconds = '00:00:30';
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
    const sessionData = await fetchCSVData();
    showSessionDetails(sessionData);
}
