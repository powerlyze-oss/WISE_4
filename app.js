// Configuration
const CONFIG = {
    SHEET_ID: '1nRPxFznNxtHneYaD31-mXr1H3DTfgifI6iciYwq64P4',
    API_KEY: 'AIzaSyDcu_Y0FGiCvyfpV_XjjBmoxLVAVPKYNyA', // For reading data
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxaZuiOO3A_LU5OUEPI2FKFKe-JqoxrGxoyVcCFY0VaK16zIaQ3BGbykuLq1giKm355zg/exec', // Replace with your deployed Apps Script URL
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
        await Promise.all([
            loadResources(),
            loadTasks()
        ]);
        renderResourcesTable();
        renderTasksTable();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please check your API key and Sheet ID.');
    } finally {
        showLoading(false);
    }
}

async function loadResources() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.RESOURCES_RANGE}?key=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    resources = data.values || [];
}

async function loadTasks() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.TASKS_RANGE}?key=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    tasks = data.values || [];
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
        console.log('Apps Script not configured. Resources saved locally:', resources);
        return;
    }

    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveResources',
                resources: resources
            })
        });
        
        console.log('Resources saved to Google Sheets');
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
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
        console.log('Apps Script not configured. Tasks saved locally:', tasks);
        return;
    }

    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveTasks',
                tasks: tasks
            })
        });
        
        console.log('Tasks saved to Google Sheets');
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        throw error;
    }
}

// Gantt Chart
function renderGanttChart() {
    const container = document.getElementById('ganttChart');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #7F8C8D;">No tasks to display</p>';
        return;
    }

    // Get date range
    const dates = tasks
        .filter(task => task[3] && task[4])
        .flatMap(task => [new Date(task[3]), new Date(task[4])]);
    
    if (dates.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #7F8C8D;">No tasks with dates</p>';
        return;
    }

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Generate months
    const months = generateMonths(minDate, maxDate);
    
    let html = '<div class="gantt-chart">';
    
    // Header
    html += '<div class="gantt-header">';
    html += '<div>Task</div>';
    html += '<div>Owner</div>';
    html += '<div>Milestone</div>';
    html += '<div>';
    html += '<div style="display: flex; gap: 0.25rem;">';
    months.forEach(month => {
        html += `
            <div class="gantt-month" style="flex: ${month.weeks};">
                <div class="gantt-month-label">${month.label}</div>
                <div class="gantt-weeks">
                    ${Array(month.weeks).fill('<div class="gantt-week"></div>').join('')}
                </div>
            </div>
        `;
    });
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Rows
    tasks.forEach(task => {
        if (!task[3] || !task[4]) return;

        const status = task[2] || 'Not started';
        const statusClass = status.toLowerCase().replace(' ', '-');
        
        html += '<div class="gantt-row">';
        html += `<div>${task[0] || ''}</div>`;
        html += `<div>${task[1] || ''}</div>`;
        html += `<div>${task[5] || ''}</div>`;
        html += '<div>';
        html += '<div style="display: flex; gap: 0.25rem; position: relative;">';
        
        const taskBar = calculateTaskBar(task[3], task[4], minDate, maxDate, months);
        
        months.forEach((month, monthIndex) => {
            html += `<div class="gantt-month" style="flex: ${month.weeks};">`;
            html += '<div class="gantt-weeks">';
            
            for (let week = 0; week < month.weeks; week++) {
                html += '<div class="gantt-week">';
                
                if (taskBar.monthIndex === monthIndex && taskBar.weekStart <= week && week <= taskBar.weekEnd) {
                    const left = week === taskBar.weekStart ? taskBar.leftOffset : 0;
                    const right = week === taskBar.weekEnd ? taskBar.rightOffset : 0;
                    html += `<div class="gantt-bar status-${statusClass}" style="left: ${left}%; right: ${right}%;"></div>`;
                }
                
                html += '</div>';
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

function generateMonths(minDate, maxDate) {
    const months = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    
    while (current <= maxDate) {
        const year = current.getFullYear();
        const month = current.getMonth();
        const monthName = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const lastDay = new Date(year, month + 1, 0).getDate();
        const weeks = Math.ceil(lastDay / 7);
        
        months.push({
            label: monthName,
            weeks: weeks,
            year: year,
            month: month
        });
        
        current.setMonth(current.getMonth() + 1);
    }
    
    return months;
}

function calculateTaskBar(startDate, endDate, minDate, maxDate, months) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Find which month the task starts
    let monthIndex = 0;
    for (let i = 0; i < months.length; i++) {
        const monthStart = new Date(months[i].year, months[i].month, 1);
        const monthEnd = new Date(months[i].year, months[i].month + 1, 0);
        
        if (start >= monthStart && start <= monthEnd) {
            monthIndex = i;
            break;
        }
    }
    
    // Calculate week positions
    const monthStart = new Date(months[monthIndex].year, months[monthIndex].month, 1);
    const dayInMonth = start.getDate();
    const weekStart = Math.floor((dayInMonth - 1) / 7);
    
    // For simplicity, assume task is within one month
    const endDayInMonth = end.getDate();
    const weekEnd = Math.min(Math.floor((endDayInMonth - 1) / 7), months[monthIndex].weeks - 1);
    
    const leftOffset = ((dayInMonth - 1) % 7) / 7 * 100;
    const rightOffset = (6 - ((endDayInMonth - 1) % 7)) / 7 * 100;
    
    return {
        monthIndex,
        weekStart,
        weekEnd,
        leftOffset,
        rightOffset
    };
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
