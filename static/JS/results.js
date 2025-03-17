 // Results Page JavaScript for ML Intrusion Detection Dashboard

// DOM Elements - Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const modelSelect = document.getElementById('model-select');
const helpLink = document.getElementById('help-link');
const helpModal = document.getElementById('helpModal');
const closeButtons = document.querySelectorAll('.close');
const viewDataBtn = document.getElementById('view-data-btn');
const dataModal = document.getElementById('dataModal');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');

// Sample model data (would be replaced with data from server)
const modelData = {
    "Logistic Regression": {
        "accuracy": 0.967,
        "precision": 0.953,
        "recall": 0.948,
        "f1": 0.951,
        "roc_auc": 0.983,
        "confusion_matrix": {
            "tn": 2420,
            "fp": 65,
            "fn": 75,
            "tp": 2440
        }
    },
    "KNN": {
        "accuracy": 0.978,
        "precision": 0.962,
        "recall": 0.974,
        "f1": 0.968,
        "roc_auc": 0.988,
        "confusion_matrix": {
            "tn": 2435,
            "fp": 50,
            "fn": 40,
            "tp": 2475
        }
    },
    "Random Forest": {

        "accuracy": 0.992,
        "precision": 0.989,
        "recall": 0.988,
        "f1": 0.988,
        "roc_auc": 0.997,
        "confusion_matrix": {
            "tn": 2450,
            "fp": 20,
            "fn": 15,
            "tp": 2515
        }
    },
    "SVM": {
        "accuracy": 0.983,
        "precision": 0.974,
        "recall": 0.979,
        "f1": 0.976,
        "roc_auc": 0.992,
        "confusion_matrix": {
            "tn": 2440,
            "fp": 40,
            "fn": 35,
            "tp": 2485
        }
    },
    "Neural Network": {
        "accuracy": 0.987,
        "precision": 0.981,
        "recall": 0.983,
        "f1": 0.982,
        "roc_auc": 0.995,
        "confusion_matrix": {
            "tn": 2445,
            "fp": 35,
            "fn": 25,
            "tp": 2495
        }
    }
};

// Sample data columns and rows (would be replaced with data from server)
const dataColumns = ["duration", "src_bytes", "dst_bytes", "logged_in", "count", "srv_count", "dst_host_count", "dst_host_srv_count", "class"];
const dataRows = [
    { "duration": 0, "src_bytes": 181, "dst_bytes": 5450, "logged_in": 1, "count": 8, "srv_count": 8, "dst_host_count": 23, "dst_host_srv_count": 23, "class": "normal" },
    { "duration": 0, "src_bytes": 239, "dst_bytes": 486, "logged_in": 1, "count": 8, "srv_count": 8, "dst_host_count": 8, "dst_host_srv_count": 8, "class": "normal" },
    { "duration": 0, "src_bytes": 235, "dst_bytes": 1337, "logged_in": 1, "count": 8, "srv_count": 8, "dst_host_count": 8, "dst_host_srv_count": 8, "class": "normal" },
    { "duration": 0, "src_bytes": 219, "dst_bytes": 1337, "logged_in": 1, "count": 6, "srv_count": 6, "dst_host_count": 4, "dst_host_srv_count": 4, "class": "normal" },
    { "duration": 0, "src_bytes": 217, "dst_bytes": 2032, "logged_in": 1, "count": 6, "srv_count": 6, "dst_host_count": 15, "dst_host_srv_count": 15, "class": "normal" },
    { "duration": 0, "src_bytes": 217, "dst_bytes": 2032, "logged_in": 1, "count": 6, "srv_count": 6, "dst_host_count": 15, "dst_host_srv_count": 15, "class": "normal" },
    { "duration": 0, "src_bytes": 212, "dst_bytes": 1940, "logged_in": 1, "count": 1, "srv_count": 1, "dst_host_count": 255, "dst_host_srv_count": 1, "class": "attack" },
    { "duration": 0, "src_bytes": 159, "dst_bytes": 4087, "logged_in": 1, "count": 5, "srv_count": 5, "dst_host_count": 255, "dst_host_srv_count": 5, "class": "attack" },
    { "duration": 0, "src_bytes": 292, "dst_bytes": 0, "logged_in": 0, "count": 1, "srv_count": 1, "dst_host_count": 1, "dst_host_srv_count": 1, "class": "attack" },
    { "duration": 0, "src_bytes": 319, "dst_bytes": 0, "logged_in": 0, "count": 1, "srv_count": 1, "dst_host_count": 1, "dst_host_srv_count": 1, "class": "attack" }
];

// Sample feature importance data (would be replaced with data from server)
const featureImportance = {
    "duration": 0.12,
    "src_bytes": 0.18,
    "dst_bytes": 0.15,
    "logged_in": 0.09,
    "count": 0.11,
    "srv_count": 0.09,
    "dst_host_count": 0.14,
    "dst_host_srv_count": 0.12
};

// Sample class distribution data (would be replaced with data from server)
const classDistribution = {
    "normal": 3500,
    "attack": 1500
};

// Initialize charts
let performanceChart, rocChart, individualMetricsChart, classDistributionChart, featureImportanceChart;

// Pagination variables
let currentPage = 1;
let rowsPerPage = 5;
let modalCurrentPage = 1;
let modalRowsPerPage = 10;

// Initialize event listeners
function initEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Model selection
    if (modelSelect) {
        modelSelect.addEventListener('change', updateModelDetails);
    }

    // Help modal
    if (helpLink && helpModal) {
        helpLink.addEventListener('click', function(e) {
            e.preventDefault();
            helpModal.style.display = 'block';
        });
    }

    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // View data button
    if (viewDataBtn && dataModal) {
        viewDataBtn.addEventListener('click', function() {
            dataModal.style.display = 'block';
            populateDataTable('full-data-table', dataRows);
        });
    }

    // Export buttons
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPdf);
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCsv);
    }

    // Pagination buttons
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateDataTable();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const maxPage = Math.ceil(dataRows.length / rowsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            updateDataTable();
        }
    });

    // Modal pagination buttons
    document.getElementById('modal-prev-page').addEventListener('click', () => {
        if (modalCurrentPage > 1) {
            modalCurrentPage--;
            updateModalDataTable();
        }
    });

    document.getElementById('modal-next-page').addEventListener('click', () => {
        const maxPage = Math.ceil(dataRows.length / modalRowsPerPage);
        if (modalCurrentPage < maxPage) {
            modalCurrentPage++;
            updateModalDataTable();
        }
    });

    // Search and filter
    const dataSearch = document.getElementById('data-search');
    const classFilter = document.getElementById('class-filter');
    
    if (dataSearch) {
        dataSearch.addEventListener('input', filterData);
    }
    
    if (classFilter) {
        classFilter.addEventListener('change', filterData);
    }
}

// Filter data based on search and class
function filterData() {
    const searchTerm = document.getElementById('data-search').value.toLowerCase();
    const classFilter = document.getElementById('class-filter').value;
    
    let filteredData = dataRows.filter(row => {
        const matchesSearch = Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchTerm)
        );
        
        const matchesClass = classFilter === 'all' || row.class === classFilter;
        
        return matchesSearch && matchesClass;
    });
    
    modalCurrentPage = 1;
    populateDataTable('full-data-table', filteredData);
    updateModalPagination(filteredData.length);
}

// Update pagination info
function updatePagination() {
    const maxPage = Math.ceil(dataRows.length / rowsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${maxPage}`;
}

function updateModalPagination(totalRows) {
    const maxPage = Math.ceil(totalRows / modalRowsPerPage);
    document.getElementById('modal-page-info').textContent = `Page ${modalCurrentPage} of ${maxPage}`;
}

// Update data table with current page
function updateDataTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = dataRows.slice(start, end);
    
    populateDataTable('data-sample-table', pageData);
    updatePagination();
}

function updateModalDataTable() {
    populateDataTable('full-data-table', dataRows); // ✅ Load all data, not just one page
    updateModalPagination(dataRows.length);
}


// Update model details based on selection
function updateModelDetails() {
    const modelMap = {
        'logistic': 'Logistic Regression',
        'knn': 'KNN',
        'rf': 'Random Forest',
        'svm': 'SVM',
        'nn': 'Neural Network'
    };
    
    const selectedModel = modelMap[modelSelect.value];
    const modelInfo = modelData[selectedModel];
    
    // Update title
    document.getElementById('model-detail-title').textContent = `${selectedModel} Metrics`;
    
    // Update confusion matrix
    document.getElementById('tn-value').textContent = modelInfo.confusion_matrix.tn;
    document.getElementById('fp-value').textContent = modelInfo.confusion_matrix.fp;
    document.getElementById('fn-value').textContent = modelInfo.confusion_matrix.fn;
    document.getElementById('tp-value').textContent = modelInfo.confusion_matrix.tp;
    
    // Update individual metrics chart
    updateIndividualMetricsChart(selectedModel, modelInfo);
}

// Initialize charts
function initCharts() {
    // Performance comparison chart
    const perfCtx = document.getElementById('performance-chart').getContext('2d');
    performanceChart = new Chart(perfCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(modelData),
            datasets: [
                {
                    label: 'Accuracy',
                    data: Object.values(modelData).map(model => model.accuracy),
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Precision',
                    data: Object.values(modelData).map(model => model.precision),
                    backgroundColor: 'rgba(111, 66, 193, 0.7)',
                    borderColor: 'rgba(111, 66, 193, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Recall',
                    data: Object.values(modelData).map(model => model.recall),
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'F1 Score',
                    data: Object.values(modelData).map(model => model.f1),
                    backgroundColor: 'rgba(23, 162, 184, 0.7)',
                    borderColor: 'rgba(23, 162, 184, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0.9,
                    max: 1.0
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
    
    // ROC-AUC comparison chart
    const rocCtx = document.getElementById('roc-chart').getContext('2d');
    rocChart = new Chart(rocCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(modelData),
            datasets: [
                {
                    label: 'ROC-AUC',
                    data: Object.values(modelData).map(model => model.roc_auc),
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0.9,
                    max: 1.0
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
    
    // Individual metrics chart
    updateIndividualMetricsChart('Random Forest', modelData['Random Forest']);
    
    // Class distribution chart
    const classDistCtx = document.getElementById('class-distribution-chart').getContext('2d');
    classDistributionChart = new Chart(classDistCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(classDistribution),
            datasets: [{
                data: Object.values(classDistribution),
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100) + '%';
                            return `${context.label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
    
    // Feature importance chart
    const featureCtx = document.getElementById('feature-importance-chart').getContext('2d');
    featureImportanceChart = new Chart(featureCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(featureImportance),
            datasets: [{
                label: 'Feature Importance',
                data: Object.values(featureImportance),
                backgroundColor: 'rgba(111, 66, 193, 0.7)',
                borderColor: 'rgba(111, 66, 193, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update individual metrics chart
function updateIndividualMetricsChart(modelName, modelInfo) {
    if (individualMetricsChart) {
        individualMetricsChart.destroy();
    }
    
    const metricsCtx = document.getElementById('individual-metrics-chart').getContext('2d');
    individualMetricsChart = new Chart(metricsCtx, {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC'],
            datasets: [{
                label: modelName,
                data: [
                    modelInfo.accuracy,
                    modelInfo.precision,
                    modelInfo.recall,
                    modelInfo.f1,
                    modelInfo.roc_auc
                ],
                backgroundColor: 'rgba(74, 111, 165, 0.2)',
                borderColor: 'rgba(74, 111, 165, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(74, 111, 165, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0.9,
                    suggestedMax: 1.0
                }
            }
        }
    });
}

// Populate data tables
function populateDataTable(tableId, data) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    // Clear existing table content
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Add headers
    for (const column of dataColumns) {
        const th = document.createElement('th');
        th.textContent = column;
        thead.appendChild(th);
    }
    
    // Add rows
    for (const row of data) {
        const tr = document.createElement('tr');
        
        for (const column of dataColumns) {
            const td = document.createElement('td');
            
            // Special handling for class column
            if (column === 'class') {
                const span = document.createElement('span');
                span.textContent = row[column];
                span.className = `class-badge ${row[column] === 'normal' ? 'normal' : 'attack'}`;
                td.appendChild(span);
            } else {
                td.textContent = row[column];
            }
            
            tr.appendChild(td);
        }
        
        tbody.appendChild(tr);
    }
}

// Populate comparison table
function populateComparisonTable() {
    const comparisonTable = document.getElementById('comparison-table');
    if (!comparisonTable) return;
    
    const tbody = comparisonTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add a row for each model
    for (const [model, metrics] of Object.entries(modelData)) {
        const tr = document.createElement('tr');
        
        // Model name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = model;
        tr.appendChild(nameCell);
        
        // Metrics cells
        for (const metric of ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']) {
            const cell = document.createElement('td');
            cell.textContent = (metrics[metric] * 100).toFixed(2) + '%';
            
            // Highlight best model
            if (model === 'Random Forest') {
                cell.className = 'best-value';
            }
            
            tr.appendChild(cell);
        }
        
        tbody.appendChild(tr);
    }
}

// Export functions
function exportToPdf() {
    alert('Generating PDF report...');
    // In a real implementation, this would use a library like jsPDF
    // to generate a PDF with the analysis results
    setTimeout(() => {
        alert('PDF report generated and downloaded!');
    }, 1500);
}

function exportToCsv() {
    alert('Exporting results to CSV...');
    // In a real implementation, this would generate CSV data
    // and trigger a download
    setTimeout(() => {
        alert('CSV results exported!');
    }, 1000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    initCharts();
    populateComparisonTable();
    updateDataTable();
});

// Add CSS class for styling the class badges
const styleSheet = document.createElement('style');
styleSheet.textContent = `
.class-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
}
.class-badge.normal {
    background-color: rgba(40, 167, 69, 0.2);
    color: rgb(40, 167, 69);
}
.class-badge.attack {
    background-color: rgba(220, 53, 69, 0.2);
    color: rgb(220, 53, 69);
}
.best-value {
    font-weight: bold;
    color: var(--primary-color);
}
`;
document.head.appendChild(styleSheet);







