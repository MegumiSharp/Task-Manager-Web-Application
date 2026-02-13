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

//Testing task 
createTask(
    "Finire relazione",
    "Completare la relazione per il corso di matematica, includendo tutti i passaggi teorici e gli esercizi svolti, revisionando le formule principali e assicurandosi che il formato sia coerente con le linee guida del professore.",
    priority.high,
    "2432354",
    states.todo,
    "14:30 11/02"
);

createTask(
    "Fare la spesa",
    "Comprare latte, pane, uova, frutta e verdura fresche per la settimana, verificare le offerte del supermercato e ricordarsi di prendere anche prodotti per la pulizia della casa e il cibo per il gatto.",
    priority.mid,
    "24232354",
    states.doing,
    "16:00 11/02"
);

createTask(
    "Pulire scrivania",
    "Riorganizzare completamente la scrivania, eliminando la polvere, sistemando i documenti in cartelle dedicate, pulendo la tastiera e il monitor, e creando uno spazio ordinato e funzionale per lavorare senza distrazioni.",
    priority.low,
    "2423235435",
    states.done,
    "10:15 11/02"
);


addEmptyTask(3);

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

        
        editTaskDialog.showModal();
    });

    const deleteTask = card.querySelector(".remove-icon")

    deleteTask.addEventListener("click", (event)=>{
        event.stopPropagation();
        deleteTask.parentElement.parentElement.remove();
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