let deleteIndex = -1;
let tasks = [];
let currentFilter = "all";
let timeLeft = 25 * 60;
let timerInterval = null;
// =============================
// Input Elements
// =============================
const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const addTask = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const searchTask = document.getElementById("searchTask");
const sortTasks = document.getElementById("sortTasks");
const allBtn = document.getElementById("all");
const pendingBtn = document.getElementById("pending");
const completedBtn = document.getElementById("completed");
const progressText = document.getElementById("progressText");
const toast = document.getElementById("toast");
const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const chartCanvas = document.getElementById("taskChart");
let taskChart;
const exportBtn = document.getElementById("exportBtn");
// =============================
// Statistics
// =============================
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
// =============================
// Progress Bar
// =============================
const progressBar = document.getElementById("progressBar");
// =============================
// Date & Time
// =============================
const dateTime = document.getElementById("dateTime");
const themeBtn = document.getElementById("themeBtn");
// =============================
// Pomodoro Timer
// =============================
const timer = document.getElementById("timer");
const startTimer = document.getElementById("startTimer");
const pauseTimer = document.getElementById("pauseTimer");
const resetTimer = document.getElementById("resetTimer");
// =============================
// Event Listeners
// =============================
addTask.addEventListener("click", addNewTask);
searchTask.addEventListener("keyup", displayTasks);
sortTasks.addEventListener("change", sortTaskList);
allBtn.addEventListener("click", function () {
    currentFilter = "all";
    displayTasks();
});
pendingBtn.addEventListener("click", function () {
    currentFilter = "pending";
    displayTasks();
});
completedBtn.addEventListener("click", function () {
    currentFilter = "completed";
    displayTasks();
});
themeBtn.addEventListener("click", toggleTheme);
startTimer.addEventListener("click", startPomodoro);
pauseTimer.addEventListener("click", pausePomodoro);
resetTimer.addEventListener("click", resetPomodoro);
taskInput.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        addNewTask();
    }
});
cancelDelete.addEventListener("click", cancelDeleteTask);
confirmDelete.addEventListener("click", confirmDeleteTask);
exportBtn.addEventListener("click", exportTasks);
// =============================
// Add New Task
// =============================
function addNewTask() {
    let text = taskInput.value.trim();
    if (text === "") {
        showToast("Please enter a task!", "toast-error");
        return;
    }
    let task = {
    name: text,
    priority: priority.value,
    dueDate: dueDate.value,
    completed: false
};
    tasks.push(task);
    saveTasks();
    showToast("Task Added Successfully", "toast-success");
    displayTasks();
    taskInput.value = "";
    dueDate.value = "";
}
// =============================
// Display Tasks
// =============================
function displayTasks() {
    taskList.innerHTML = "";
    let visibleTasks = 0;
    let searchText = searchTask.value.toLowerCase();
    tasks.forEach(function (task, index) {
        // Search
        if (!task.name.toLowerCase().includes(searchText)) {
            return;
        }
        // Pending Filter
        if (currentFilter === "pending" && task.completed) {
            return;
        }
        // Completed Filter
        if (currentFilter === "completed" && !task.completed) {
            return;
        }
        let div = document.createElement("div");
div.classList.add("task");
// Check Due Date
let today = new Date();
today.setHours(0, 0, 0, 0);
if (!task.completed && task.dueDate) {
    let due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
        div.classList.add("overdue");
    }
    else if (due.getTime() === today.getTime()) {
        div.classList.add("today");
    }
    else {
        div.classList.add("upcoming");
    }
}
        div.innerHTML = `
<div class="task-header">
    <h3 class="${task.completed ? "completed-task" : ""}">
        📘 ${task.name}
    </h3>
</div>
<div class="task-details">
    <span class="priority ${task.priority.toLowerCase()}">
        ${task.priority}
    </span>
    <span class="due-date">
        📅 ${task.dueDate || "No Due Date"}
    </span>
</div>
<div class="task-actions">
    <button class="complete-btn"
        onclick="completeTask(${index})">
        ✔ Complete
    </button>
    <button class="edit-btn"
        onclick="editTask(${index})">
        ✏ Edit
    </button>
    <button class="delete-btn"
        onclick="deleteTask(${index})">
        🗑 Delete
    </button>
</div>
`;
        taskList.appendChild(div);
        visibleTasks++;
    });
    if (visibleTasks === 0) {
    taskList.innerHTML = `
        <div class="empty-state">
            <h1>📋</h1>
            <h2>No Tasks Yet</h2>
            <p>Start by adding your first task!</p>
        </div>
    `;
}
if (taskList.innerHTML === "") {
    taskList.innerHTML = `
        <div class="empty-state">
            <h1>📝</h1>
            <h2>No Tasks Found</h2>
            <p>Add a new task to start your productive day!</p>
        </div>
    `;
}
    updateStatistics();
}
// =============================
// Update Analytics Chart
// =============================
function updateChart() {
    let completed = tasks.filter(task => task.completed).length;
    let pending = tasks.length - completed;
    if (taskChart) {
        taskChart.destroy();
    }
    taskChart = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending],
                backgroundColor: [
                    "#22c55e",
                    "#ef4444"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}
// =============================
// Delete Task (Open Confirmation Modal)
// =============================
function deleteTask(index) {
    deleteIndex = index;
    deleteModal.style.display = "flex";
}
// =============================
// Confirm Delete Task
// =============================
function confirmDeleteTask() {
    if (deleteIndex !== -1) {
        tasks.splice(deleteIndex, 1);
        saveTasks();
        displayTasks();
        showToast("Task Deleted Successfully", "toast-info");
    }
    deleteModal.style.display = "none";
    deleteIndex = -1;
}
// =============================
// Cancel Delete
// =============================
function cancelDeleteTask() {
    deleteModal.style.display = "none";
    deleteIndex = -1;
}
// =============================
// Complete Task
// =============================
function completeTask(index) {
    tasks[index].completed = true;
    saveTasks();
    showToast("Task Completed", "toast-success");
    displayTasks();
}
// =============================
// Edit Task
// =============================
function editTask(index) {
    let newTask = prompt(
        "Edit Task",
        tasks[index].name
    );
    if (newTask === null) {
        return;
    }
    newTask = newTask.trim();
    if (newTask === "") {
        alert("Task cannot be empty!");
        return;
    }
    tasks[index].name = newTask;
    saveTasks();
    displayTasks();
}
// =============================
// Sort Tasks
// =============================
function sortTaskList() {
    let option = sortTasks.value;
    if(option === "priority"){
        let order = {
            "High":1,
            "Medium":2,
            "Low":3
        };
        tasks.sort(function(a,b){
            return order[a.priority]-order[b.priority];
        });
    }
    else if(option === "date"){
        tasks.sort(function(a,b){
            return new Date(a.dueDate)-new Date(b.dueDate);
        });
    }
    else if(option === "name"){
        tasks.sort(function(a,b){
            return a.name.localeCompare(b.name);
        });
    }
    saveTasks();
    displayTasks();
}
// =============================
// Update Statistics
// =============================
function updateStatistics() {
    totalTasks.innerText = tasks.length;
    let completed = tasks.filter(task => task.completed).length;
    completedTasks.innerText = completed;
    pendingTasks.innerText = tasks.length - completed;
    let percent = 0;
    if (tasks.length > 0) {
        percent = (completed / tasks.length) * 100;
    }
    progressBar.style.width = percent + "%";
    progressText.innerText = Math.round(percent) + "%";
    // Update Analytics Chart
    updateChart();
}
// =============================
// Date & Time
// =============================
function updateDateTime() {
    let now = new Date();
    dateTime.innerHTML =
        now.toLocaleDateString() +
        "<br>" +
        now.toLocaleTimeString();
}
updateDateTime();
setInterval(updateDateTime, 1000);
// =============================
// Update Timer Display
// =============================
function updateTimerDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timer.innerHTML =
        String(minutes).padStart(2,"0")
        + ":" +
        String(seconds).padStart(2,"0");
}
// =============================
// Dark Mode
// =============================
function toggleTheme() {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        themeBtn.innerHTML = "☀";
        localStorage.setItem("theme", "dark");
    } else {
        themeBtn.innerHTML = "🌙";
        localStorage.setItem("theme", "light");
    }
}
// =============================
// Toast Notification
// =============================
function showToast(message, type){
    toast.innerText = message;
    toast.className = "";
    toast.classList.add(type);
    toast.classList.add("show");
    setTimeout(function(){
        toast.classList.remove("show");
    },3000);
}
// =============================
// Start Timer
// =============================
function startPomodoro(){
    if(timerInterval){
        return;
    }
    timerInterval = setInterval(function(){
        if(timeLeft > 0){
            timeLeft--;
            updateTimerDisplay();
        }else{
            clearInterval(timerInterval);
            timerInterval = null;
            alert("🎉 Focus Session Completed!");
        }
    },1000);
}
// =============================
// Pause Timer
// =============================
function pausePomodoro(){
    clearInterval(timerInterval);
    timerInterval = null;
}
// =============================
// Reset Timer
// =============================
function resetPomodoro(){
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
}
// =============================
// Save Tasks
// =============================
function saveTasks() {
    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}
// =============================
// Load Tasks
// =============================
function loadTasks() {
    let storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    displayTasks();
    let savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML = "☀";
    } else {
        themeBtn.innerHTML = "🌙";
    }
}
// =============================
// Motivation Quotes
// =============================
const quotes = [
    {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier"
    },
    {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain"
    },
    {
        text: "Dream big. Start small. Act now.",
        author: "Robin Sharma"
    },
    {
        text: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
    }
];
function loadQuote() {
    let random = Math.floor(Math.random() * quotes.length);
    quoteText.innerHTML = '"' + quotes[random].text + '"';
    quoteAuthor.innerHTML = "- " + quotes[random].author;
}
// =============================
// Export Tasks to CSV
// =============================
function exportTasks() {
    if (tasks.length === 0) {
        alert("No tasks available to export!");
        return;
    }
    let csv = "Task,Priority,Due Date,Status\n";
    tasks.forEach(function(task){
        csv += `"${task.name}","${task.priority}","${task.dueDate || ""}","${task.completed ? "Completed" : "Pending"}"\n`;
    });
    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "FocusFlow_Tasks.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Tasks Exported Successfully", "toast-success");
}
// =============================
// Initial Load
// =============================
updateTimerDisplay();
loadTasks();
loadQuote();