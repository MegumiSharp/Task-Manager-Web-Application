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
                    ${priority}
                </div>
                <p class="timestamp">${timestamp}</p>
            </div>
        </div>`);

    const card = document.getElementById(uid);

    card.addEventListener("click", () =>{
        console.log("hai cliccato la card con riferimento: " + uid)
        overlay.classList.add("open");
        editTaskDialog.showModal();
    });
}

const overlay = document.querySelector('.overlay');


//Click outside the 
const modalContent = editTaskDialog.querySelector('.modal-content');

editTaskDialog.addEventListener("click", (event)=>{
    if(event.target !== modalContent){
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
    
    closeModal();
});

