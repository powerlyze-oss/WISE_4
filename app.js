// Configuration
const CONFIG = {
    SHEET_ID: '1nRPxFznNxtHneYaD31-mXr1H3DTfgifI6iciYwq64P4',
    API_KEY: 'AIzaSyDcu_Y0FGiCvyfpV_XjjBmoxLVAVPKYNyA', // For reading data
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbydmXDCpba3u4pSQx2qhetMXR4b3qDvQt2TxIQw4ZiMypX758dXNEBa8ag3Rruuvd-4xg/exec', // Replace with your deployed Apps Script URL
    RESOURCES_SHEET: 'Project_resources',
    TASKS_SHEET: 'Project_tasks',
    RESOURCES_RANGE: 'Project_resources!A2:B',
    TASKS_RANGE: 'Project_tasks!A2:H',
    USE_APPS_SCRIPT: true // Set to true to enable write operations
};

let resources = [];
let tasks = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadData();
});

// Tab Management
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Render Gantt chart if switching to gantt tab
    if (tabName === 'gantt') {
        renderGanttChart();
    }
}

// Data Loading
async function loadData() {
    showLoading(true);
    try {
        console.log('=== Starting to load data from Google Sheets ===');
        console.log('Sheet ID:', CONFIG.SHEET_ID);
        console.log('API Key:', CONFIG.API_KEY.substring(0, 10) + '...');
        
        await Promise.all([
            loadResources(),
            loadTasks()
        ]);
        
        console.log('=== Data loaded successfully ===');
        renderResourcesTable();
        renderTasksTable();
    } catch (error) {
        console.error('=== Error loading data ===');
        console.error('Error:', error);
        
        let errorMessage = 'Error loading data from Google Sheets.\n\n';
        
        if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
            errorMessage += '🔑 API Key Error:\n';
            errorMessage += '1. Go to Google Cloud Console\n';
            errorMessage += '2. APIs & Services → Credentials\n';
            errorMessage += '3. Edit your API Key\n';
            errorMessage += '4. Application restrictions → HTTP referrers\n';
            errorMessage += '5. Add: http://localhost:*/* and http://127.0.0.1:*/*\n\n';
            errorMessage += 'OR run: python -m http.server 8000\n';
            errorMessage += 'Then open: http://localhost:8000/index.html';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += '🌐 Network Error:\n';
            errorMessage += '1. Check your internet connection\n';
            errorMessage += '2. Make sure Google Sheets API is enabled\n';
            errorMessage += '3. Check if Sheet ID is correct';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        showLoading(false);
    }
}

async function loadResources() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.RESOURCES_RANGE}?key=${CONFIG.API_KEY}`;
    console.log('Loading resources from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        console.error('Google Sheets API Error:', data.error);
        throw new Error(`API Error: ${data.error.message}`);
    }
    
    resources = data.values || [];
    console.log('Resources loaded:', resources.length, 'items');
}

async function loadTasks() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.TASKS_RANGE}?key=${CONFIG.API_KEY}`;
    console.log('Loading tasks from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        console.error('Google Sheets API Error:', data.error);
        throw new Error(`API Error: ${data.error.message}`);
    }
    
    tasks = data.values || [];
    console.log('Tasks loaded:', tasks.length, 'items');
}

// Resources Management
function renderResourcesTable() {
    const tbody = document.getElementById('resourcesBody');
    tbody.innerHTML = '';

    resources.forEach((resource, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${resource[0] || ''}</td>
            <td>${resource[1] || ''}</td>
            <td>
                <button class="btn btn-edit" onclick="editResource(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteResource(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateTaskOwnerOptions();
}

function showResourceModal(editIndex = null) {
    const modal = document.getElementById('resourceModal');
    const form = document.getElementById('resourceForm');
    const title = document.getElementById('resourceModalTitle');

    if (editIndex !== null) {
        title.textContent = 'Edit Resource';
        document.getElementById('resourceRowIndex').value = editIndex;
        document.getElementById('resourceName').value = resources[editIndex][0] || '';
        document.getElementById('resourceRole').value = resources[editIndex][1] || '';
    } else {
        title.textContent = 'Add Resource';
        form.reset();
        document.getElementById('resourceRowIndex').value = '';
    }

    modal.style.display = 'block';
}

function closeResourceModal() {
    document.getElementById('resourceModal').style.display = 'none';
    document.getElementById('resourceForm').reset();
}

function editResource(index) {
    showResourceModal(index);
}

async function deleteResource(index) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    showLoading(true);
    try {
        // In a real implementation, you would call Google Sheets API to delete
        // For now, we'll simulate by removing from array
        resources.splice(index, 1);
        await saveResourcesToSheet();
        renderResourcesTable();
    } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Error deleting resource.');
    } finally {
        showLoading(false);
    }
}

document.getElementById('resourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);

    try {
        const name = document.getElementById('resourceName').value;
        const role = document.getElementById('resourceRole').value;
        const rowIndex = document.getElementById('resourceRowIndex').value;

        if (rowIndex !== '') {
            // Edit existing
            resources[parseInt(rowIndex)] = [name, role];
        } else {
            // Add new
            resources.push([name, role]);
        }

        await saveResourcesToSheet();
        renderResourcesTable();
        closeResourceModal();
    } catch (error) {
        console.error('Error saving resource:', error);
        alert('Error saving resource.');
    } finally {
        showLoading(false);
    }
});

async function saveResourcesToSheet() {
    if (!CONFIG.USE_APPS_SCRIPT || !CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
        console.log('Apps Script not configured.');
        return;
    }

    try {
        const params = encodeURIComponent(JSON.stringify(resources));
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=saveResources&data=${params}`;
        
        await fetch(url);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadResources();
        
        console.log('Resources saved');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Tasks Management
function renderTasksTable() {
    const tbody = document.getElementById('tasksBody');
    tbody.innerHTML = '';

    tasks.forEach((task, index) => {
        const status = task[2] || 'Not started';
        const statusClass = status.toLowerCase().replace(' ', '-');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task[0] || ''}</td>
            <td>${task[1] || ''}</td>
            <td><span class="status-badge status-${statusClass}">${status}</span></td>
            <td>${task[3] || ''}</td>
            <td>${task[4] || ''}</td>
            <td>${task[5] || ''}</td>
            <td>
                <button class="btn btn-edit" onclick="editTask(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTask(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateTaskOwnerOptions() {
    const select = document.getElementById('taskOwner');
    select.innerHTML = '<option value="">Select Owner</option>';
    
    resources.forEach(resource => {
        const option = document.createElement('option');
        option.value = resource[0];
        option.textContent = resource[0];
        select.appendChild(option);
    });
}

function showTaskModal(editIndex = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('taskModalTitle');

    if (editIndex !== null) {
        title.textContent = 'Edit Task';
        document.getElementById('taskRowIndex').value = editIndex;
        document.getElementById('taskName').value = tasks[editIndex][0] || '';
        document.getElementById('taskOwner').value = tasks[editIndex][1] || '';
        document.getElementById('taskStatus').value = tasks[editIndex][2] || 'Not started';
        document.getElementById('taskStartDate').value = tasks[editIndex][3] || '';
        document.getElementById('taskEndDate').value = tasks[editIndex][4] || '';
        document.getElementById('taskMilestone').value = tasks[editIndex][5] || '';
        document.getElementById('taskNotes').value = tasks[editIndex][7] || '';
        
        if (tasks[editIndex][6]) {
            document.getElementById('currentDeliverable').textContent = `Current: ${tasks[editIndex][6]}`;
        }
    } else {
        title.textContent = 'Add Task';
        form.reset();
        document.getElementById('taskRowIndex').value = '';
        document.getElementById('currentDeliverable').textContent = '';
    }

    modal.style.display = 'block';
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    document.getElementById('taskForm').reset();
}

function editTask(index) {
    showTaskModal(index);
}

async function deleteTask(index) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    showLoading(true);
    try {
        tasks.splice(index, 1);
        await saveTasksToSheet();
        renderTasksTable();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task.');
    } finally {
        showLoading(false);
    }
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);

    try {
        const taskName = document.getElementById('taskName').value;
        const owner = document.getElementById('taskOwner').value;
        const status = document.getElementById('taskStatus').value;
        const startDate = document.getElementById('taskStartDate').value;
        const endDate = document.getElementById('taskEndDate').value;
        const milestone = document.getElementById('taskMilestone').value;
        const notes = document.getElementById('taskNotes').value;
        const fileInput = document.getElementById('taskDeliverable');
        
        let deliverable = '';
        const rowIndex = document.getElementById('taskRowIndex').value;
        
        if (rowIndex !== '' && tasks[parseInt(rowIndex)][6]) {
            deliverable = tasks[parseInt(rowIndex)][6];
        }
        
        if (fileInput.files.length > 0) {
            deliverable = fileInput.files[0].name;
            // In real implementation, upload file to Google Drive or other storage
        }

        const taskData = [taskName, owner, status, startDate, endDate, milestone, deliverable, notes];

        if (rowIndex !== '') {
            tasks[parseInt(rowIndex)] = taskData;
        } else {
            tasks.push(taskData);
        }

        await saveTasksToSheet();
        renderTasksTable();
        closeTaskModal();
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task.');
    } finally {
        showLoading(false);
    }
});

async function saveTasksToSheet() {
    if (!CONFIG.USE_APPS_SCRIPT || !CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
        console.log('Apps Script not configured.');
        return;
    }

    try {
        const params = encodeURIComponent(JSON.stringify(tasks));
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=saveTasks&data=${params}`;
        
        await fetch(url);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadTasks();
        
        console.log('Tasks saved');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Gantt Chart
function resetGanttFilters() {
    document.getElementById('ganttStartDate').value = '';
    document.getElementById('ganttEndDate').value = '';
    document.getElementById('ganttOwnerFilter').value = '';
    renderGanttChart();
}

function updateGanttOwnerFilter() {
    const select = document.getElementById('ganttOwnerFilter');
    const currentValue = select.value;
    
    // Get unique owners from tasks
    const owners = [...new Set(tasks.filter(t => t[1]).map(t => t[1]))].sort();
    
    // Rebuild options
    select.innerHTML = '<option value="">All Owners</option>';
    owners.forEach(owner => {
        const option = document.createElement('option');
        option.value = owner;
        option.textContent = owner;
        select.appendChild(option);
    });
    
    // Restore selected value if it still exists
    if (currentValue && owners.includes(currentValue)) {
        select.value = currentValue;
    }
}

function renderGanttChart() {
    const container = document.getElementById('ganttChart');
    
    // Update owner filter options
    updateGanttOwnerFilter();
    
    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #7F8C8D;">No tasks to display</p>';
        return;
    }

    // Get filters
    const filterStartDate = document.getElementById('ganttStartDate').value;
    const filterEndDate = document.getElementById('ganttEndDate').value;
    const filterOwner = document.getElementById('ganttOwnerFilter').value;
    
    // Sort and filter tasks
    let sortedTasks = [...tasks]
        .filter(task => task[3] && task[4]); // Only tasks with dates
    
    // Filter by owner if selected
    if (filterOwner) {
        sortedTasks = sortedTasks.filter(task => task[1] === filterOwner);
    }
    
    // Sort by start date
    sortedTasks.sort((a, b) => {
        const dateA = new Date(a[3]);
        const dateB = new Date(b[3]);
        return dateA - dateB;
    });
    
    if (sortedTasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #7F8C8D;">No tasks match the selected filters</p>';
        return;
    }

    // Calculate date range
    let minDate, maxDate;
    
    if (filterStartDate && filterEndDate) {
        minDate = new Date(filterStartDate);
        maxDate = new Date(filterEndDate);
    } else {
        const dates = sortedTasks.flatMap(task => [new Date(task[3]), new Date(task[4])]);
        minDate = new Date(Math.min(...dates));
        maxDate = new Date(Math.max(...dates));
    }
    
    // Adjust to start of month and end of month
    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    
    // Generate months with full weeks (7 days including weekends)
    const months = generateMonthsWithFullWeeks(minDate, maxDate);
    
    // Calculate today position
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPosition = calculateTodayPosition(today, months, minDate, maxDate);
    
    let html = '<div class="gantt-chart">';
    
    // Header
    html += '<div class="gantt-header">';
    html += '<div>Task</div>';
    html += '<div>Owner</div>';
    html += '<div>Milestone</div>';
    html += '<div>';
    html += '<div class="gantt-timeline" style="position: relative;">';
    
    // Add Today line in header if applicable
    if (todayPosition.show) {
        html += `<div class="gantt-today-line" style="left: ${todayPosition.percentage}%;"></div>`;
    }
    
    months.forEach(month => {
        html += `<div class="gantt-month" style="flex: ${month.days};">`;
        html += `<div class="gantt-month-label">${month.label}</div>`;
        html += '<div class="gantt-weeks">';
        
        // Create day cells (7 days per week including weekends)
        for (let i = 0; i < month.days; i++) {
            html += '<div class="gantt-week"></div>';
        }
        
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Rows
    sortedTasks.forEach(task => {
        const status = task[2] || 'Not started';
        const statusClass = status.toLowerCase().replace(' ', '-');
        
        html += '<div class="gantt-row">';
        html += `<div>${task[0] || ''}</div>`;
        html += `<div>${task[1] || ''}</div>`;
        html += `<div>${task[5] || ''}</div>`;
        html += '<div>';
        html += '<div class="gantt-timeline" style="position: relative;">';
        
        // Add Today line in row if applicable
        if (todayPosition.show) {
            html += `<div class="gantt-today-line" style="left: ${todayPosition.percentage}%; top: 0; height: 100%;"></div>`;
        }
        
        // Calculate task bar position across all months
        const taskStart = new Date(task[3]);
        const taskEnd = new Date(task[4]);
        const bars = calculateTaskBars(taskStart, taskEnd, months, minDate);
        
        months.forEach((month, monthIndex) => {
            html += `<div class="gantt-month" style="flex: ${month.days};">`;
            html += '<div class="gantt-weeks">';
            
            // Check if task has bar in this month
            const monthBar = bars.find(bar => bar.monthIndex === monthIndex);
            
            if (monthBar) {
                // Render all day cells with bar overlay
                for (let day = 0; day < month.days; day++) {
                    html += '<div class="gantt-week">';
                    
                    if (day >= monthBar.startDay && day <= monthBar.endDay) {
                        const leftOffset = day === monthBar.startDay ? monthBar.leftOffset : 0;
                        const rightOffset = day === monthBar.endDay ? monthBar.rightOffset : 0;
                        const width = 100 - leftOffset - rightOffset;
                        
                        html += `<div class="gantt-bar status-${statusClass}" 
                                      style="left: ${leftOffset}%; width: ${width}%;" 
                                      title="${task[0]} (${task[3]} to ${task[4]})"></div>`;
                    }
                    
                    html += '</div>';
                }
            } else {
                // Empty days
                for (let day = 0; day < month.days; day++) {
                    html += '<div class="gantt-week"></div>';
                }
            }
            
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        html += '</div>';
        html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

function calculateTodayPosition(today, months, minDate, maxDate) {
    // Check if today is within the displayed range
    if (today < minDate || today > maxDate) {
        return { show: false, percentage: 0 };
    }
    
    // Calculate total days in the timeline
    let totalDays = 0;
    let daysBeforeToday = 0;
    let foundToday = false;
    
    for (const month of months) {
        totalDays += month.days;
        
        if (!foundToday) {
            // Check if today is in this month
            if (today >= month.startDate && today <= month.endDate) {
                daysBeforeToday += today.getDate() - 1; // Days before today in this month
                foundToday = true;
            } else if (today > month.endDate) {
                daysBeforeToday += month.days; // All days in this month
            }
        }
    }
    
    if (!foundToday) {
        return { show: false, percentage: 0 };
    }
    
    const percentage = (daysBeforeToday / totalDays) * 100;
    return { show: true, percentage: percentage };
}

function generateMonthsWithFullWeeks(minDate, maxDate) {
    const months = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    
    while (current <= maxDate) {
        const year = current.getFullYear();
        const month = current.getMonth();
        const monthName = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        // Get actual number of days in month
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        months.push({
            label: monthName,
            days: lastDay, // Full days in month (28-31)
            year: year,
            month: month,
            startDate: new Date(year, month, 1),
            endDate: new Date(year, month + 1, 0)
        });
        
        current.setMonth(current.getMonth() + 1);
    }
    
    return months;
}

function calculateTaskBars(taskStart, taskEnd, months, chartStartDate) {
    const bars = [];
    
    months.forEach((month, monthIndex) => {
        const monthStart = month.startDate;
        const monthEnd = month.endDate;
        
        // Check if task overlaps with this month
        if (taskEnd >= monthStart && taskStart <= monthEnd) {
            // Calculate start and end days within this month
            const effectiveStart = taskStart > monthStart ? taskStart : monthStart;
            const effectiveEnd = taskEnd < monthEnd ? taskEnd : monthEnd;
            
            const startDay = effectiveStart.getDate() - 1; // 0-indexed
            const endDay = effectiveEnd.getDate() - 1; // 0-indexed
            
            // Calculate offsets for partial day rendering
            const leftOffset = 0; // Start of day
            const rightOffset = 0; // End of day
            
            bars.push({
                monthIndex: monthIndex,
                startDay: startDay,
                endDay: endDay,
                leftOffset: leftOffset,
                rightOffset: rightOffset
            });
        }
    });
    
    return bars;
}

// Utility Functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const resourceModal = document.getElementById('resourceModal');
    const taskModal = document.getElementById('taskModal');
    
    if (event.target === resourceModal) {
        closeResourceModal();
    }
    if (event.target === taskModal) {
        closeTaskModal();
    }
}

// Suppress browser extension errors
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('Extension context invalidated')) {
        e.preventDefault();
        return true;
    }
});

window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.message && 
        (e.reason.message.includes('message channel closed') || 
         e.reason.message.includes('Extension context'))) {
        e.preventDefault();
        return true;
    }
});
