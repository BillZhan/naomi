// Firebase 配置
const firebaseConfig = {
    apiKey: "你的API密钥",
    authDomain: "你的Firebase应用域名",
    databaseURL: "https://你的Firebase应用名.firebaseio.com",
    projectId: "你的项目ID",
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 获取 HTML 元素
const clockDisplay = document.getElementById("clock");
let timerInterval;

// 时钟与计时器
function updateClock() {
    const now = new Date();
    clockDisplay.innerText = now.toLocaleTimeString();
}

function startTimer() {
    timerInterval = setInterval(updateClock, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// 添加任务
function addTask(subject, text) {
    const newTaskRef = db.ref(`tasks/${subject}`).push();
    newTaskRef.set({ text, completed: false });
}
// 获取输入框和选择框元素
const taskInput = document.getElementById("task-input");
const subjectSelect = document.getElementById("subject-select");

// 添加任务函数
function addTask() {
    const taskText = taskInput.value.trim();
    const subject = subjectSelect.value;

    if (taskText) {
        const newTaskRef = db.ref(`tasks/${subject}`).push();
        newTaskRef.set({
            text: taskText,
            completed: false,
            timestamp: Date.now(),
        });
        
        // 清空输入框
        taskInput.value = "";
    } else {
        alert("请输入作业内容！");
    }
}

// 初始化任务列表
updateTaskList();

// 更新任务列表
function updateTaskList() {
    ["math", "chinese", "english", "other"].forEach(subject => {
        const taskList = document.getElementById(`${subject}-list`);
        taskList.innerHTML = "";
        db.ref(`tasks/${subject}`).on("value", snapshot => {
            snapshot.forEach(taskSnapshot => {
                const task = taskSnapshot.val();
                const taskItem = document.createElement("li");
                taskItem.innerHTML = `
                    ${task.text}
                    <button onclick="toggleComplete('${subject}', '${taskSnapshot.key}')">
                        ${task.completed ? "未完成" : "完成"}
                    </button>
                `;
                taskItem.className = task.completed ? "completed" : "";
                taskList.appendChild(taskItem);
            });
        });
    });
}

// 切换完成状态
function toggleComplete(subject, taskId) {
    const taskRef = db.ref(`tasks/${subject}/${taskId}`);
    taskRef.once("value", snapshot => {
        const task = snapshot.val();
        taskRef.update({ completed: !task.completed });
    });
}

// 完成所有任务
function completeAll() {
    ["math", "chinese", "english", "other"].forEach(subject => {
        db.ref(`tasks/${subject}`).once("value", snapshot => {
            snapshot.forEach(taskSnapshot => {
                const taskRef = taskSnapshot.ref;
                taskRef.update({ completed: true });
            });
        });
    });
    document.getElementById("score-count").innerText++;
}

// 生成数据报表
function generateReport() {
    db.ref("tasks").once("value", snapshot => {
        let reportText = "完成记录：\n";
        snapshot.forEach(subjectSnapshot => {
            reportText += `${subjectSnapshot.key}：\n`;
            subjectSnapshot.forEach(taskSnapshot => {
                const task = taskSnapshot.val();
                reportText += `- ${task.text}：${task.completed ? "完成" : "未完成"}\n`;
            });
        });
        alert(reportText);
    });
}

// 初始化任务列表
updateTaskList();
