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
    sessionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sessionData.labels,
            datasets: [{
                label: 'Time (s)',
                data: sessionData.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to handle session button clicks
function onSessionButtonClick(sessionName) {
    // Example data; replace with actual data
    const sessionData = {
        'Session-1': {
            numberOfShakes: 2,
            averageTime: '00:00:30',
            totalTime: '00:01:00',
            labels: ['00:00:00', '03:47:23'],
            data: [30, 30]
        },
        'Session-2': {
            numberOfShakes: 3,
            averageTime: '00:00:45',
            totalTime: '00:02:15',
            labels: ['Shake 1', 'Shake 2', 'Shake 3'],
            data: [45, 45, 45]
        }
        // Add more sessions as needed
    };

    // Show the session details for the selected session
    showSessionDetails(sessionData[sessionName]);
}
