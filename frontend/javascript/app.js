const states = {
    todo : "To-Do",
    doing : "Doing",
    done : "Done"
}

const priority = {
    low : "Low",
    mid : "Mid",
    high : "High"
}

const credit = "✅ Credit";
const debit = "❌ Debit";
const refund = "💰 Refund"



let walletTransactions = [];

let walletBalance = 0;

let currentCard = null;

const API_URL = 'http://127.0.0.1:8000';
let taskArray = [];
loadAndDisplayTask();
async function loadAndDisplayTask(){
    taskArray = await getAllTask();

    taskArray.forEach(element => {
        createTask(element.title, element.description, element.urgency, element.uid, element.state, element.datetime)
    })

    defaultArrayOrdering();
}

updateWalletBalance("", 100)

function updateWalletBalance(operation, amount){
    const walletText = document.querySelector(".wallet-amount");

    if (operation === "remove" && walletBalance === 0){
        alert("Balance cannot be negative")
        return
    }

    if (operation === "add") {
        walletText.classList.add("increase");
        walletBalance += amount
        setTimeout(()=>{ walletText.classList.remove("increase");},300)
    
    }
    else if(operation === "remove") {
        walletText.classList.add("decrease");
        walletBalance -= amount
        setTimeout(()=>{ walletText.classList.remove("decrease");},300)
    } 
    else {walletBalance = amount}

    walletText.textContent = walletBalance;

    if(walletBalance === 0){
        document.querySelector(".button.add-new-task").disabled = true;
    }else{
        document.querySelector(".button.add-new-task").disabled = false;
    }
}



const editTaskDialog = document.querySelector("#edit-modal");


/*Create placeholder for tasks*/
function addEmptyTask(taskNum){
    const taskboard = document.querySelector(".tasks-board");

    for (let i= 0; i < taskNum; i++){
        const task = document.createElement('div')
        task.classList.add('empty-task');

        taskboard.appendChild(task);
    }
}


const addTaskModalButton = editTaskDialog.querySelector("#add-task-modal")
//addEmptyTask(3);

function createTask(title, desc, priority, uid, state, timestamp){
    const taskBoard = document.querySelector(".tasks-board");

    // Crea il container
    const task = document.createElement('div');
    task.className = `task ${state}`;
    task.id = uid;

    task.innerHTML = `
         <div class="state-button-frame">
            <div class="state ${state}">${state}</div>
            <img class="remove-icon" src="/frontend/resources/icons/remove.svg">
        </div>
        <div class="title-desc-frame">
            <p class="task-title"></p>
            <p class="task-desc"></p>
        </div>
        <div class="priority-timestamp-frame">
            <div class="priority ${priority}">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7.66696" cy="7.66696" r="7.66696" fill="currentColor"/>
                </svg>
                <div></div>
            </div>
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                <title>Done</title>
                <g>
                    <path fill="currentColor" d="M43.707,9.878c-.391-.391-1.024-.391-1.414,0l-25.293,25.293L5.707,23.878c-.391-.391-1.024-.391-1.414,0l-1.414,1.414c-.391,.391-.391,1.024,0,1.414l13.414,13.414c.391,.391,1.024,.391,1.414,0L45.122,12.707c.391-.391,.391-1.024,0-1.414l-1.414-1.414Z"></path>
                </g>
            </svg>
            <p class="timestamp"></p>
        </div>`;

    task.querySelector(".task-title").textContent = title;
    task.querySelector(".task-desc").textContent = desc;
    task.querySelector(".priority div").textContent = priority;
    task.querySelector(".timestamp").textContent = timestamp;

    taskBoard.appendChild(task);

    const card = document.getElementById(uid);

    card.addEventListener("click", () =>{
        currentCard = card;
        
        overlay.classList.add("open");

        const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
        const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description");

        const currentCardDesc = currentCard.querySelector(".task-desc");
        const currentCardTitle = currentCard.querySelector(".task-title");
        const curretCardState = currentCard.querySelector(".state");

        const currentCardPriority = currentCard.querySelector(".priority");

        setActiveOption(modalStates, curretCardState.textContent);
        setActiveOption(modalPriority, currentCardPriority.textContent.trim())

        modalTitle.value = currentCardTitle.textContent;
        modalTitle.textContent = currentCardTitle.textContent;

        modalDesc.value = currentCardDesc.textContent;

        
        addTaskModalButton.setAttribute("style", "display: none");
        editModalButton.setAttribute("style", "display: block");
        
        editTaskDialog.showModal();
    });

    const deleteTask = card.querySelector(".remove-icon")

    deleteTask.addEventListener("click", (event)=>{
        event.stopPropagation();

        //Refund 1 token if state is not in done
        if(deleteTask.parentElement.textContent.trim("") !== 'Done'){
            updateWalletBalance("add", 1)
        }

        deleteTask.parentElement.parentElement.remove();
        deleteTaskFromDb(uid);
    });


    const checkMark = card.querySelector(".checkmark");

    checkMark.addEventListener("click", (e)=>{

        e.stopPropagation();
        const curretCardState = card.querySelector(".state")

        if (curretCardState.textContent !== "Done"){
            updateWalletBalance("add", 2)
                    
            curretCardState.className = "state Done";
            curretCardState.textContent = "Done";
            card.className = 'task Done';

            const index = taskArray.findIndex(t => t.uid === uid);
            console.log(taskArray[index])
            taskArray[index].state = "Done";
            
            createTransaction(credit, uid, taskArray[index].title)
            editTask(uid, taskArray[index])
        }
    })

}


const overlay = document.querySelector('.overlay');



//Click outside the 
const modalContent = editTaskDialog.querySelector('.modal-content');

editTaskDialog.addEventListener("click", (event)=>{
    //The modal is behind the content, when clicked close the modal
    if(event.target === editTaskDialog){
        closeModal(editTaskDialog);  
    }
});



editTaskDialog.addEventListener("keydown",(event)=>{
    if(event.key === 'Escape'){ 
        event.preventDefault();
        closeModal(editTaskDialog)}
})

function closeModal(modal){
    modal.classList.add('closing');
    setTimeout(()=>{
        overlay.classList.remove("open");
        modal.close();
        modal.classList.remove('closing');
        
    },300);
}


const editModalButton = editTaskDialog.querySelector('#close-modal');


editModalButton.addEventListener("click", () => {
    // Ottieni valori dal modal
    const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title").value;
    const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description").value;
    const modalState = editTaskDialog.querySelector(".state:not(.inactive)");
    const modalPrio = editTaskDialog.querySelector(".modpriority:not(.inactive)");
    const modalPrioText = modalPrio.textContent.replace("Priority", "").trim();
    const modalStateText = modalState.textContent;


    // Aggiorna DOM della card
    updateCardDOM(currentCard, {
        title: modalTitle,
        description: modalDesc,
        priority: modalPrioText,
        state: modalStateText
    });
    
    // Aggiorna task nell'array e salva
    const taskId = currentCard.id;
    const index = taskArray.findIndex(t => t.uid === taskId);
    taskArray[index].title = modalTitle;
    taskArray[index].description = modalDesc;
    taskArray[index].urgency = modalPrioText;
    taskArray[index].state = modalStateText;
        
    editTask(taskId, taskArray[index]);
    createEvent("TASK_UPDATED",taskArray[index].uid, modalTitle, modalPrioText , modalStateText)
    
    closeModal(editTaskDialog);
});

// Funzione helper per aggiornare DOM
function updateCardDOM(card, data) {
    card.querySelector(".task-title").textContent = data.title;
    card.querySelector(".task-desc").textContent = data.description;
    
    const stateElement = card.querySelector(".state");
    stateElement.className = `state ${data.state}`;
    stateElement.textContent = data.state;
    
    const priorityElement = card.querySelector(".priority");
    priorityElement.className = `priority ${data.priority}`;
    priorityElement.querySelector("div").textContent = data.priority;
    
    card.className = `task ${data.state}`;
}


function setActiveOption(container, optionClass){

    let childrens = Array.from(container.children);

    childrens.forEach(element =>{
        element.classList.add('inactive');
         
        if (element.classList.contains(optionClass)){
            
            element.classList.remove('inactive');
        }
    })
}



const modalPriority =  document.querySelector(".modal-priority");
const modalStates =  document.querySelector(".modal-state");

toggleInactive(modalPriority);
toggleInactive(modalStates);

/**
 * Toggles 'inactive' class on container children.
 * When an element is clicked, removes 'inactive' from it
 * and adds it to all other siblings.
 */
function toggleInactive(selector){
    selector.addEventListener("click", (e)=>{

        const clickedDiv = e.target;
        clickedDiv.classList.remove("inactive");

        if(clickedDiv.parentElement === selector){
            let otherDivs = Array.from(selector.children).filter(div => div !== clickedDiv);

            otherDivs.forEach(element => {
                element.classList.add("inactive");
            });
        }
    });
}


const closeModalBtn = editTaskDialog.querySelector(".close-window");

closeModalBtn.addEventListener("click", ()=>{closeModal(editTaskDialog);});


const addNewTaskBtn = document.querySelector('.add-new-task');

addNewTaskBtn.addEventListener("click", ()=> {

        overlay.classList.add("open");

        const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
        const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description");

        setActiveOption(modalStates, "To-Do");
        setActiveOption(modalPriority, "Low");

        //Reset the valu ein fiedl to let placeholder takes place
        modalTitle.value = ""
        modalDesc.value = ""

        addTaskModalButton.setAttribute("style", "display: block");
        editModalButton.setAttribute("style", "display: none");

        //By deafault the title is empy so the add task is disabled
        document.querySelector("#add-task-modal").disabled = true
        editTaskDialog.showModal();
});


addTaskModalButton.addEventListener("click",()=>{

    updateWalletBalance("remove", 1)
    
    const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title").value;
    const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description").value;
    const uuid  = crypto.randomUUID();

    const modalPrio = editTaskDialog.querySelector(".modpriority:not(.inactive)");
    const modalState = editTaskDialog.querySelector(".state:not(.inactive)").textContent;

    const modalPrioText = modalPrio.textContent.replace("Priority", "");
        
    const date = new Date(Date.now());
    const hh = String(date.getHours()).padStart(2,'0');
    const min = String(date.getMinutes()).padStart(2,'0');;
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth() + 1).padStart(2,'0');
    const now = `${hh}:${min} ${dd}/${mm}`

    console.log('hey')
    createTask(
        modalTitle,
        modalDesc,
        modalPrioText,
        uuid,
        modalState,
        now,
    );


    
    addTaskToArray(modalTitle, modalDesc, modalPrioText, uuid, modalState, now)
    createEvent("TASK_CREATED",uuid, modalTitle, modalPrioText , modalState)

    saveTask(taskArray[taskArray.length -1])
    closeModal(editTaskDialog);
});


function addTaskToArray(title, desc, priority, uid, state, timestamp){
    let task = {
        title: title,
        description: desc,
        urgency: priority,
        uid: uid,
        state: state,
        datetime: timestamp
    };
    console.log('hey2')
    taskArray.push(task);
    console.log(taskArray)
}



/*Try to sent the task dictionarity ad http post request, 
  if not possibile trhow an error.*/
async function saveTask(task){
    try{
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if(!response.ok){ throw new Error(`HTTP error! Status ${response.status}`)}

        const data = await response.json();
        console.log('✅ Task Salvato:', data.message);
        return data;
    } 
    catch(error){
        console.error('Errore nel salvataggio del task:', error)
        alert('Errore nel salvataggio del task. Riprova più tardi.');
        return null;
    }
}

async function deleteTaskFromDb(task_id){
    try{
        const response = await fetch(`${API_URL}/tasks/${task_id}`,{
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        })

        if(!response.ok){ throw new Error(`HTTP error! Status ${response.status}`)}

        const data = await response.json();
        console.log('✅ Task eliminato:', data.message);
        return data;

    }catch(error){
        console.error('Errore nel eliminare il task:', error)
        alert("Errore nell'eliminare il task Riprova più tardi.");
        return null;
    }
}


async function getAllTask(){
    try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) throw new Error('Errore nel recupero dei task');
            return await response.json();
        } catch (error) {
            console.error('Errore:', error);
            return [];
        }
}

async function editTask(task_id, task){
    try{
        const response = await fetch(`${API_URL}/tasks/${task_id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(task)
        });
        
        if (!response.ok) throw new Error(`HTTP error! Status ${response.status}`);
        
        const data = await response.json();
        console.log('✅ Task aggiornato:', data.message);
        return data;
    } catch(error) {
        console.error('Errore nell\'aggiornamento del task:', error);
        alert('Errore nell\'aggiornare il task. Riprova più tardi.');
        return null;
    }
}


/*By Default the Task are ordered by this group hierarchy To-Do > Doing > Done
Every state group is ordered by priority High > Mid >Low.
Lastly every task is ordered by newest first using timestamp*/
function defaultArrayOrdering(){

    const map = { 'High': 1, 'Mid': 2, 'Low': 3 }
    const state = { 'To-Do': 1, 'Doing': 2, 'Done': 3 }

    const temp  = taskArray;

    temp.sort((a, b)=>{
       
        //Sort by state
        const stateDiff = state[a.state.trim()] - state[b.state.trim()]
        if(stateDiff !== 0) return stateDiff;
        
        //Sort by Priority
        const urgencyDiff = map[a.urgency.trim()] - map[b.urgency.trim()]
        if (urgencyDiff !== 0) return urgencyDiff;

        //Sort by date
        return convertDate(b.datetime) - convertDate(a.datetime) 
    })

    cleanTaskBoard();
    taskArray.forEach(element => {
        createTask(element.title, element.description, element.urgency, element.uid, element.state, element.datetime)
    })

}

async function cleanTaskBoard(){
    const taskBoard = document.querySelector(".tasks-board");
    taskBoard.innerHTML = '';
}

function convertDate(dateTime){
    
    const [time, date] = dateTime.split(" ");
    const [hours, minutes] = time.split(":")
    const [day, month] = date.split("/")

    const year = new Date().getFullYear();

    return new Date(year,month-1, day, hours, minutes).getTime();
}


const searchBar = document.querySelector(".search-bar");
let searchTimeout;

searchBar.addEventListener("input", (e)=>{
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);


    searchTimeout = setTimeout(()=>{
        if (query.length >=2){
            searchQuery(query);
        }else{
            searchQuery("")
        }

    }, 600)
})

//Disable enter key to go to new line in search bar
searchBar.addEventListener("keydown", (event)=>{
    if(event.key === "Enter"){
         event.preventDefault();
    }
})


const modalEditTitle = document.querySelector(".edit-modal-text-area.title")
modalEditTitle.addEventListener("keydown", (event)=>{
    if(event.key === "Enter"){
         event.preventDefault();
    }
})


function searchQuery(query){
    const lowerQuery = query.toLowerCase();
    
    const filteredTasks = taskArray.filter(task =>{
        return task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery) ||
        task.urgency.toLowerCase().includes(lowerQuery) ||
        task.state.toLowerCase().includes(lowerQuery) ||
        task.datetime.toLowerCase().includes(lowerQuery)
    })
    

    cleanTaskBoard();
    filteredTasks.forEach(task=>{
        createTask(task.title, task.description, task.urgency, task.uid, task.state, task.datetime);
    })
}


let eventTracker = [];


function createEvent(type, task_id, title, priority, state){
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    const EventType = Object.freeze({
        TASK_CREATED: 'TASK_CREATED',
        TASK_UPDATED: 'TASK_UPDATED',
        TASK_DELETED: 'TASK_DELETED',
        WALLET_DEBIT: 'WALLET_DEBIT',
        WALLET_CREDIT: 'WALLET_CREDIT'
    });

    const event = {
        type: EventType[type],
        timestamp: now,
        payload: {
            taskId: task_id,
            title: title,
            priority: priority,
            state: state,
        }
    }

    eventTracker.push(event)
}

function createTransaction(type, task_id, title){
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    let amount = 0;

    if(type === credit){amount = "+2"}
    else if(type === debit){amount = "-1"}
    else if(type === refund){amount = "+1"}

    const transaction = {
        type: type,
        timestamp: now,
        title: title,
        uid: task_id,
        balance: walletBalance,
        amount: amount
    }
    walletTransactions.push(transaction); 
}

function formatTransactionLog(){
    let formattedTransaction = ""
    
    walletTransactions.forEach(element=>{
        formattedTransaction += `
        ------------------------------------------------------------------
        [ID TASK] = [${element.uid}]
        [${element.timestamp}] | [${element.type}] 
        Title: ${element.title}
        Amound: [${element.amount}]
        Balance After: [${element.balance}]
        ------------------------------------------------------------------
        `
    })
    return formattedTransaction
}



// Create a task, update a task, edit a task(ONLY TITLE, PRIORITY O STATE), DELETE A TASK, CREATE AN EVENT


// Do something --> CreateEvent --> Add event to array and save it on database
//On startup database pull event tracker and write on array


const auditLogModal = document.querySelector("#auditLog-modal")
const auditLogBtn = document.querySelector(".button.audit")
const auditLogTextArea = auditLogModal.querySelector(".audit-log-text-area")

auditLogBtn.addEventListener("click", ()=>{

    document.body.classList.add("no-scroll")
    overlay.classList.add("open");
    auditLogTextArea.textContent = formatAuditLog(); //torna qui
    auditLogModal.showModal()
});

function formatAuditLog(){

    let formattedEvents = ""

    eventTracker.forEach(element=>{

        if (element.type === ("TASK_CREATED" || "TASK_UPDATED" || "TASK_DELETED")){
            formattedEvents += `
            ----------------------------------------------------------------
            [${element.timestamp}] - [${element.type}]
                Task ID: ${element.payload.taskId}
                Title: ${element.payload.title}
                Priority: ${element.payload.priority}
                State: ${element.payload.state}
            ----------------------------------------------------------------`
        }

    })
    return formattedEvents
}

auditLogModal.addEventListener("click", (event)=>{
    //The modal is behind the content, when clicked close the modal
    if(event.target === auditLogModal){
        closeModal(auditLogModal)
    }
});

auditLogModal.addEventListener("keydown",(event)=>{
    if(event.key === 'Escape'){ 
        event.preventDefault();
        closeModal(auditLogModal)}
})

const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");

modalTitle.addEventListener("input", (e)=>{
    
    const query = e.target.value.trim();
    if(query === ""){
        document.querySelector("#close-modal").disabled = true
        document.querySelector("#add-task-modal").disabled = true
    }else{
        document.querySelector("#close-modal").disabled = false
        document.querySelector("#add-task-modal").disabled = false
    }
})