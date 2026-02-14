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




let cardCorrent = null;

const API_URL = 'http://127.0.0.1:8000';
let taskArray = [];

loadAndDisplayTask();
async function loadAndDisplayTask(){
    taskArray = await getAllTask();

    taskArray.forEach(element => {
        createTask(element.title, element.description, element.priority, element.uid, element.state, element.timestamp)
    })
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

    taskBoard.insertAdjacentHTML("beforeend",`
         <div class="task ${state}" id="${uid}">
            <div class="state-button-frame">
                <div class="state ${state}">${state}</div>
                <img  class="remove-icon" src="/frontend/resources/icons/remove.svg">
            </div>
            <div class="title-desc-frame">
                <p class="task-title">${title}</p>
                <p class="task-desc">${desc}</p>
            </div>
            <div class="priority-timestamp-frame">
                <div class="priority ${priority}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7.66696" cy="7.66696" r="7.66696" fill="currentColor"/>
                    </svg>
                    <div>${priority}</div>
                </div>
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                    <title>Done</title>
                    <g>
                        <path fill="currentColor" d="M43.707,9.878c-.391-.391-1.024-.391-1.414,0l-25.293,25.293L5.707,23.878c-.391-.391-1.024-.391-1.414,0l-1.414,1.414c-.391,.391-.391,1.024,0,1.414l13.414,13.414c.391,.391,1.024,.391,1.414,0L45.122,12.707c.391-.391,.391-1.024,0-1.414l-1.414-1.414Z"></path>
                    </g>
                </svg>
                <p class="timestamp">${timestamp}</p>
            </div>
        </div>`);

    const card = document.getElementById(uid);

    card.addEventListener("click", () =>{
        cardCorrent = card;
        
        overlay.classList.add("open");

        const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
        const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description");

        const currentCardDesc = cardCorrent.querySelector(".task-desc");
        const currentCardTitle = cardCorrent.querySelector(".task-title");
        const curretCardState = cardCorrent.querySelector(".state");

        const currentCardPriority = cardCorrent.querySelector(".priority");

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
        deleteTask.parentElement.parentElement.remove();
        deleteTaskFromDb(uid);
    });


    const checkMark = card.querySelector(".checkmark");

    checkMark.addEventListener("click", (e)=>{

        const curretCardState = card.querySelector(".state")
        e.stopPropagation();
        curretCardState.className = "state Done";
        curretCardState.textContent = "Done";
        card.className = 'task Done';

    })

}

const overlay = document.querySelector('.overlay');



//Click outside the 
const modalContent = editTaskDialog.querySelector('.modal-content');

editTaskDialog.addEventListener("click", (event)=>{
    //The modal is behind the content, when clicked close the modal
    if(event.target === editTaskDialog){
        closeModal();  
    }
});


function closeModal(){
    editTaskDialog.classList.add('closing');
    setTimeout(()=>{
        overlay.classList.remove("open");
        editTaskDialog.close();
        editTaskDialog.classList.remove('closing');
        
    },300);
}


const editModalButton = editTaskDialog.querySelector('#close-modal');


editModalButton.addEventListener("click", () =>{
    const currentCardDesc = cardCorrent.querySelector(".task-desc");
    const currentCardPriority = cardCorrent.querySelector(".priority")

    const modalState = editTaskDialog.querySelector(".state:not(.inactive)");
    const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
    const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description");
    
    const modalPrio = editTaskDialog.querySelector(".modpriority:not(.inactive)");

    const modalPrioText = modalPrio.textContent.replace("Priority", "");

    //When edit button cliccked, the priority text in the card changes based on the priority toggle
    currentCardPriority.className = "priority " + modalPrioText;
    currentCardPriority.querySelector("div").textContent  = modalPrioText;

    currentCardDesc.textContent = modalDesc.value;
    cardCorrent.querySelector(".task-title").textContent = modalTitle.value;
    cardCorrent.querySelector(".state").className = modalState.className;
    cardCorrent.querySelector(".state").textContent =  modalState.textContent;
    cardCorrent.className = 'task ' +  modalState.textContent;
    
    closeModal();
});



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

closeModalBtn.addEventListener("click", ()=>{closeModal();});


const addNewTaskBtn = document.querySelector('.add-new-task');

addNewTaskBtn.addEventListener("click", ()=> {

        overlay.classList.add("open");

        const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
        const modalDesc = editTaskDialog.querySelector(".edit-modal-text-area.description");

        setActiveOption(modalStates, "To-Do");
        setActiveOption(modalPriority, "Low");

        modalTitle.value = "Title Task"

        modalDesc.value = "Describe your task here.."



        addTaskModalButton.setAttribute("style", "display: block");
        editModalButton.setAttribute("style", "display: none");
        editTaskDialog.showModal();
});


addTaskModalButton.addEventListener("click",()=>{

    
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

    createTask(
        modalTitle,
        modalDesc,
        modalPrioText,
        uuid,
        modalState,
        now,
    );
    
    addTaskToArray(modalTitle, modalDesc, modalPrioText, uuid, modalState, now)
    
    saveTask(taskArray[taskArray.length -1])
    closeModal();
});


function addTaskToArray(title, desc, priority, uid, state, timestamp){
    let task = {
        title: title,
        description: desc,
        urgency: priority,
        id: uid,
        state: state,
        datetime: timestamp
    };
    
    taskArray.push(task);
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