document.addEventListener('DOMContentLoaded', function() {
    const eegForm = document.getElementById('eegForm');
    const resultContainer = document.getElementById('result');
    
    eegForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous results and show loading state
        resultContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner">
                    <div></div>
                    <div></div>
                </div>
                <p>Processing EEG data...</p>
            </div>
        `;
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
    
        // Validate inputs
        let invalidInputs = 0;
        for (let key in data) {
            if (isNaN(data[key]) || data[key] === '') {
                invalidInputs++;
                const inputField = document.getElementById(key);
                if (inputField) {
                    inputField.classList.add('input-error');
                    
                    // Add error message below the input
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.innerText = 'Please enter a valid number';
                    inputField.parentNode.appendChild(errorMsg);
                    
                    // Clear error state after 3 seconds
                    setTimeout(() => {
                        inputField.classList.remove('input-error');
                        if (errorMsg.parentNode) {
                            errorMsg.parentNode.removeChild(errorMsg);
                        }
                    }, 3000);
                }
            }
        }
        
        if (invalidInputs > 0) {
            resultContainer.innerHTML = `
                <div class="error-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${invalidInputs} field(s) contain invalid data. Please enter numerical values for all fields.</p>
                </div>
            `;
            return;
        }
    
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Display formatted result
            resultContainer.innerHTML = `
                <div class="prediction-result ${result.prediction === 'Positive' ? 'positive-result' : 'negative-result'}">
                    <div class="result-header">
                        <i class="fas ${result.prediction === 'Positive' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <h3>Prediction Result</h3>
                    </div>
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">Classification:</span>
                            <span class="result-value">${result.prediction}</span>
                        </div>
                        ${result.confidence ? `
                        <div class="result-item">
                            <span class="result-label">Confidence:</span>
                            <span class="result-value">${(result.confidence * 100).toFixed(2)}%</span>
                        </div>
                        ` : ''}
                        ${result.processing_time ? `
                        <div class="result-item">
                            <span class="result-label">Processing Time:</span>
                            <span class="result-value">${result.processing_time.toFixed(3)}s</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="result-actions">
                        <button class="btn-secondary" onclick="savePrediction()">
                            <i class="fas fa-save"></i> Save Result
                        </button>
                        <button class="btn-secondary" onclick="sharePrediction()">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            `;
            
            // Add this prediction to recent analyses (would normally be handled by backend)
            updateRecentAnalyses(result);
            
        } catch (error) {
            console.error('Error:', error);
            resultContainer.innerHTML = `
                <div class="error-alert">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>An error occurred: ${error.message || 'Could not process your request'}</p>
                    <button class="btn-primary" onclick="retrySubmission()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    });
    
    // Reset form button handler
    const resetButton = document.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            eegForm.reset();
            resultContainer.innerHTML = `
                <div class="result-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <p>Submit EEG data to see prediction results</p>
                </div>
            `;
        });
    }
    
    // Initialize charts if needed
    initializeDashboardCharts();
});

// Function to update recent analyses table (for demonstration)
function updateRecentAnalyses(result) {
    const recentTable = document.querySelector('.recent-table tbody');
    if (!recentTable) return;
    
    const now = new Date();
    const dateStr = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Create a new row for the recent analysis
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>P-${10000 + Math.floor(Math.random() * 1000)}</td>
        <td>${dateStr}</td>
        <td><span class="tag tag-${result.prediction.toLowerCase()}">${result.prediction}</span></td>
        <td>${result.confidence ? (result.confidence * 100).toFixed(0) : '90'}%</td>
        <td><button class="btn-icon"><i class="fas fa-eye"></i></button></td>
    `;
    
    // Add the new row at the top
    if (recentTable.firstChild) {
        recentTable.insertBefore(newRow, recentTable.firstChild);
        
        // Remove the last row if there are more than 5
        if (recentTable.children.length > 5) {
            recentTable.removeChild(recentTable.lastChild);
        }
    } else {
        recentTable.appendChild(newRow);
    }
}

// Function to initialize dashboard charts
function initializeDashboardCharts() {
    const activityChart = document.getElementById('activityChart');
    if (!activityChart) return;
    
    // Remove placeholder if it exists
    const placeholder = activityChart.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Sample data for the chart
    const chartData = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [
            {
                label: 'Positive Predictions',
                data: [12, 15, 18, 14, 20, 22, 19],
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.2)',
                tension: 0.4
            },
            {
                label: 'Negative Predictions',
                data: [8, 10, 6, 9, 12, 8, 11],
                borderColor: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                tension: 0.4
            }
        ]
    };
    
    // Create canvas for Chart.js
    const canvas = document.createElement('canvas');
    activityChart.appendChild(canvas);
    
    // Initialize chart
    new Chart(canvas, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Helper functions for button actions
function savePrediction() {
    alert('Prediction saved successfully!');
    // In a real application, this would call an API endpoint to save the prediction
}

function sharePrediction() {
    alert('Sharing options would appear here');
    // In a real application, this would open a modal with sharing options
}

function retrySubmission() {
    document.getElementById('eegForm').dispatchEvent(new Event('submit'));
}

// CSV Upload handling (placeholder)
const uploadButton = document.querySelector('button[data-action="upload"]');
if (uploadButton) {
    uploadButton.addEventListener('click', function() {
        // Create a hidden file input and trigger it
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                alert(`CSV file "${file.name}" selected. Processing would happen here.`);
                // In a real application, you would parse the CSV and populate the form
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // Remove the input after selection
        setTimeout(() => {
            document.body.removeChild(fileInput);
        }, 5000);
    });
}

// Sidebar Toggle
function toggleSidebar() {
    document.querySelector('.dashboard-container').classList.toggle('sidebar-collapsed');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// Form Navigation
let currentStep = 1;
const totalSteps = 3;

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    
    // Update dots
    document.querySelectorAll('.step-indicator .dot').forEach((dot, index) => {
        dot.classList.toggle('active', index < step);
    });
    
    // Show/hide buttons
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const submitBtn = document.getElementById('submitForm');
    
    prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
    nextBtn.style.display = step === totalSteps ? 'none' : 'inline-block';
    submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';
}

document.getElementById('nextStep')?.addEventListener('click', () => {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
});

document.getElementById('prevStep')?.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
});

// Tab Navigation
document.querySelectorAll('.tab-btn')?.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and panes
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        const tabId = button.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Initialize Charts
function initializeCharts() {
    // Prediction Chart
    const predictionCtx = document.getElementById('predictionChart')?.getContext('2d');
    if (predictionCtx) {
        new Chart(predictionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Class A', 'Class B', 'Class C'],
                datasets: [{
                    data: [30, 50, 20],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 206, 86, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Features Chart
    const featuresCtx = document.getElementById('featuresChart')?.getContext('2d');
    if (featuresCtx) {
        new Chart(featuresCtx, {
            type: 'bar',
            data: {
                labels: ['F1', 'F2', 'F3', 'F4', 'F5'],
                datasets: [{
                    label: 'Feature Importance',
                    data: [85, 72, 65, 58, 45],
                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCharts);

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
  
    setTimeout(() => toast.classList.add('hide'), duration);
    setTimeout(() => toast.remove(), duration + 400);
}


