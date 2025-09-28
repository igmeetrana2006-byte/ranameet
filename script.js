// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log("Service Worker Registered"))
        .catch(err => console.log(err));
}

// ---------- Tab Navigation ----------
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    const tab = document.getElementById(tabName);
    if(tab) tab.style.display = 'block';
    const btn = Array.from(document.querySelectorAll('.tab-nav .tab-btn'))
        .find(b => b.textContent.toLowerCase() === tabName);
    if(btn) btn.classList.add('active');
}

// ---------- Login ----------
const loginForm = document.getElementById('loginForm');
const appSection = document.getElementById('app');
const loginSection = document.getElementById('login');

if(localStorage.getItem('username')){
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    openTab('routine');
}

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if(username){
        localStorage.setItem('username', username);
        loginSection.style.display = 'none';
        appSection.style.display = 'block';
        openTab('routine');
    }
});

// ---------- Utility ----------
function saveToStorage(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function getFromStorage(key){ return JSON.parse(localStorage.getItem(key)) || []; }

// ---------- Routine ----------
const routineForm = document.getElementById('routineForm');
const routineDisplay = document.getElementById('routineDisplay');

routineForm.addEventListener('submit', e => {
    e.preventDefault();
    const routine = {
        wakeUp: document.getElementById('wakeUp').value,
        sleep: document.getElementById('sleep').value,
        studyHours: document.getElementById('studyHours').value
    };
    saveToStorage('routine', routine);
    displayRoutine(routine);
});

function displayRoutine(routine){
    routineDisplay.innerHTML = `
        <p>Wake Up: ${routine.wakeUp}</p>
        <p>Sleep: ${routine.sleep}</p>
        <p>Study Hours: ${routine.studyHours}</p>
    `;
}
if(localStorage.getItem('routine')) displayRoutine(JSON.parse(localStorage.getItem('routine')));

// ---------- Meals ----------
const mealForm = document.getElementById('mealForm');
const mealDisplay = document.getElementById('mealDisplay');

mealForm.addEventListener('submit', e => {
    e.preventDefault();
    const meals = {
        breakfast: document.getElementById('breakfast').value,
        lunch: document.getElementById('lunch').value,
        dinner: document.getElementById('dinner').value
    };
    saveToStorage('meals', meals);
    displayMeals(meals);
});

function displayMeals(meals){
    mealDisplay.innerHTML = `
        <p>Breakfast: ${meals.breakfast}</p>
        <p>Lunch: ${meals.lunch}</p>
        <p>Dinner: ${meals.dinner}</p>
    `;
}
if(localStorage.getItem('meals')) displayMeals(JSON.parse(localStorage.getItem('meals')));

// ---------- Gym ----------
const gymForm = document.getElementById('gymForm');
const gymDisplay = document.getElementById('gymDisplay');

gymForm.addEventListener('submit', e => {
    e.preventDefault();
    const gym = {
        gymTime: document.getElementById('gymTime').value,
        exercises: document.getElementById('exercises').value
    };
    saveToStorage('gym', gym);
    displayGym(gym);
});

function displayGym(gym){
    gymDisplay.innerHTML = `
        <p>Workout Time: ${gym.gymTime}</p>
        <p>Exercises: ${gym.exercises}</p>
    `;
}
if(localStorage.getItem('gym')) displayGym(JSON.parse(localStorage.getItem('gym')));

// ---------- Notes, Classwork, Homework ----------
function handleList(formId, inputId, listId, storageKey){
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    form.addEventListener('submit', e => {
        e.preventDefault();
        if(!input.value) return;
        let items = getFromStorage(storageKey);
        items.push(input.value);
        saveToStorage(storageKey, items);
        renderList(items, list, storageKey);
        input.value = '';
    });

    renderList(getFromStorage(storageKey), list, storageKey);
}

function renderList(items, list, storageKey){
    list.innerHTML = '';
    items.forEach((item, i) => {
        const li = document.createElement('li');
        li.textContent = item;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => {
            items.splice(i,1);
            saveToStorage(storageKey, items);
            renderList(items, list, storageKey);
        };
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

handleList('notesForm','noteText','notesList','notes');
handleList('classworkForm','classworkText','classworkList','classwork');
handleList('homeworkForm','homeworkText','homeworkList','homework');

// ---------- Reminders ----------
const reminderForm = document.getElementById('reminderForm');
const reminderList = document.getElementById('reminderList');

reminderForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('reminderText').value;
    const time = document.getElementById('reminderTime').value;
    if(!text || !time) return;

    let reminders = getFromStorage('reminders');
    reminders.push({ text, time, notified:false });
    saveToStorage('reminders', reminders);
    renderReminders(reminders);
    document.getElementById('reminderText').value = '';
    document.getElementById('reminderTime').value = '';
});

function renderReminders(reminders){
    reminderList.innerHTML = '';
    reminders.forEach((r,i)=>{
        const li = document.createElement('li');
        li.textContent = `${r.text} - ${new Date(r.time).toLocaleString()}`;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = ()=>{
            reminders.splice(i,1);
            saveToStorage('reminders', reminders);
            renderReminders(reminders);
        };
        li.appendChild(delBtn);
        reminderList.appendChild(li);
    });
}

renderReminders(getFromStorage('reminders'));

// ---------- Notifications ----------
if("Notification" in window){ Notification.requestPermission(); }

function checkReminders(){
    let reminders = getFromStorage('reminders');
    const now = new Date().getTime();
    reminders.forEach(r=>{
        const t = new Date(r.time).getTime();
        if(!r.notified && t <= now){
            if(Notification.permission === "granted"){
                new Notification("Reminder", {body: r.text});
            }
            r.notified = true;
        }
    });
    saveToStorage('reminders', reminders);
}
setInterval(checkReminders, 30000);

// ---------- Default Tab ----------
openTab('routine');
