import { processTransaction, createEvent, setWalletTransactions } from "./headerModal.js";
import { TRANSACTION_TYPES } from "./config.js";
import { closeModal, openModalOverlay, getTimeTaskFormat } from "./utils.js";
import { createTask, deleteTask, getTasks, updateTask } from "./api.js";
import { setTaskArray, getTaskArray, findTaskInArray, getTaskByIndex, getLength, addTaskToArray} from "./taskArray.js";
import { renderTasks } from "./taskArray.js";

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







setWalletTransactions();


let currentCard = null;

loadAndDisplayTask();

async function loadAndDisplayTask(){

    setTaskArray(await getTasks())

    getTaskArray().forEach(element => {
        createDOMTask(element.title, element.description, element.urgency, element.uid, element.state, element.datetime)
    })

    renderTasks();
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

export function createDOMTask(title, desc, priority, uid, state, timestamp){
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
        
        openModalOverlay();

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

    const deleteTaskBTN = card.querySelector(".remove-icon")

    deleteTaskBTN.addEventListener("click", (event)=>{
        event.stopPropagation();

        //Refund 1 token if state is not in done
        if(deleteTaskBTN.parentElement.textContent.trim("") !== 'Done'){
            processTransaction(TRANSACTION_TYPES.REFUND, uid, title)
        }

        deleteTaskBTN.parentElement.parentElement.remove();
        deleteTask(uid);
    });


    const checkMark = card.querySelector(".checkmark");

    checkMark.addEventListener("click", (e)=>{

        e.stopPropagation();
        const curretCardState = card.querySelector(".state")

        if (curretCardState.textContent !== "Done"){                    
            curretCardState.className = "state Done";
            curretCardState.textContent = "Done";
            card.className = 'task Done';

            const findedTask = findTaskInArray(uid)
            findedTask.state = "Done";
            
            processTransaction(TRANSACTION_TYPES.CREDIT, uid, findedTask.title)
            updateTask(uid, findedTask)
        }
    })

}


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
    const findedTask = findTaskInArray(taskId);
    findedTask.title = modalTitle;
    findedTask.description = modalDesc;
    findedTask.urgency = modalPrioText;
    findedTask.state = modalStateText;
        
    updateTask(taskId, findedTask);
    createEvent("TASK_UPDATED",findedTask.uid, modalTitle, modalPrioText , modalStateText)
    
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

        openModalOverlay();

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
    const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title").value;
    const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description").value;
    const uuid  = crypto.randomUUID();

    const modalPrio = editTaskDialog.querySelector(".modpriority:not(.inactive)");
    const modalState = editTaskDialog.querySelector(".state:not(.inactive)").textContent;

    const modalPrioText = modalPrio.textContent.replace("Priority", "");
        
    const now = getTimeTaskFormat();

    createDOMTask(
        modalTitle,
        modalDesc,
        modalPrioText,
        uuid,
        modalState,
        now,
    );

    addTaskToArray(modalTitle, modalDesc, modalPrioText, uuid, modalState, now)
    createEvent("TASK_CREATED",uuid, modalTitle, modalPrioText , modalState)
    processTransaction(TRANSACTION_TYPES.DEBIT, uuid, modalTitle)

    createTask(getTaskByIndex(getLength() -1))
    closeModal(editTaskDialog);
});



const modalEditTitle = document.querySelector(".edit-modal-text-area.title")
modalEditTitle.addEventListener("keydown", (event)=>{
    if(event.key === "Enter"){
         event.preventDefault();
    }
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