/* ============================================================
   IMPORTS
   ============================================================ */
import { processTransaction, createEvent, setWalletTransactions, setAuditLog } from "./headerModal.js";
import { TRANSACTION_TYPES, EVENTS_TYPES, setUsername } from "./config.js";
import { closeModal, openModalOverlay, getTimeTaskFormat } from "./utils.js";
import { createTask, deleteTask, getTasks, updateTask } from "./api.js";
import { setTaskArray, getTaskArray, findTaskInArray, getTaskByIndex, getLength, addTaskToArray, deleteTaskInArray, renderTasks } from "./taskArray.js";


/* ============================================================
   INITIALIZATION
   Runs on page load: sets the user, loads wallet/audit data,
   fetches tasks from the API and renders them in the DOM.
   ============================================================ */
setUsername();
setWalletTransactions();
setAuditLog();

let currentCard = null;

loadAndDisplayTask();

async function loadAndDisplayTask() {
    setTaskArray(await getTasks());

    getTaskArray().forEach(element => {
        createDOMTask(element.title, element.description, element.urgency, element.uid, element.state, element.datetime);
    });

    renderTasks();
}


/* ============================================================
   DOM REFERENCES
   ============================================================ */
const editTaskDialog  = document.querySelector("#edit-modal");
const modalContent    = editTaskDialog.querySelector(".modal-content");
const modalPriority   = document.querySelector(".modal-priority");
const modalStates     = document.querySelector(".modal-state");
const addTaskModalButton = editTaskDialog.querySelector("#add-task-modal");
const editModalButton    = editTaskDialog.querySelector("#close-modal");
const closeModalBtn      = editTaskDialog.querySelector(".close-window");
const addNewTaskBtn      = document.querySelector(".add-new-task");
const modalEditTitle     = document.querySelector(".edit-modal-text-area.title");


/* ============================================================
   TASK CREATION — DOM
   Builds a task card, appends it to the board and attaches
   all card-level event listeners (open edit, delete, checkmark).
   ============================================================ */
export function createDOMTask(title, desc, priority, uid, state, timestamp) {
    const taskBoard = document.querySelector(".tasks-board");

    const task = document.createElement("div");
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
                    <path fill="currentColor" d="M43.707,9.878c-.391-.391-1.024-.391-1.414,0l-25.293,25.293L5.707,23.878c-.391-.391-1.024-.391-1.414,0l-1.414,1.414c-.391,.391-.391,1.024,0,1.414l13.414,13.414c.391,.391,1.024,.391,1.414,0L45.122,12.707c.391-.391,.391-1.024,0-1.414l-1.414-1.414Z"/>
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

    /* --- Open edit modal when card is clicked --- */
    card.addEventListener("click", () => {
        currentCard = card;
        openModalOverlay();

        const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
        const modalDesc  = editTaskDialog.querySelector(".edit-modal-text-area.description");

        modalTitle.value = card.querySelector(".task-title").textContent;
        modalDesc.value  = card.querySelector(".task-desc").textContent;

        setActiveOption(modalStates,   card.querySelector(".state").textContent);
        setActiveOption(modalPriority, card.querySelector(".priority").textContent.trim());

        addTaskModalButton.setAttribute("style", "display: none");
        editModalButton.setAttribute("style", "display: block");

        checkStatusCard();
        editTaskDialog.showModal();
    });

    /* --- Delete task button --- */
    const deleteTaskBTN = card.querySelector(".remove-icon");

    deleteTaskBTN.addEventListener("click", (event) => {
        event.stopPropagation();

        createEvent(EVENTS_TYPES.deleted, uid, title, priority, state);

        // Refund 1 token only if the task was not already Done
        if (deleteTaskBTN.parentElement.textContent.trim() !== "Done") {
            processTransaction(TRANSACTION_TYPES.REFUND, uid, title);
            createEvent(EVENTS_TYPES.wallet_credit, uid, title, priority, state);
        }

        deleteTaskBTN.parentElement.parentElement.remove();
        deleteTaskInArray(uid);
        deleteTask(uid);
    });

    /* --- Checkmark: mark task as Done --- */
    const checkMark = card.querySelector(".checkmark");

    checkMark.addEventListener("click", (e) => {
        e.stopPropagation();

        const curretCardState = card.querySelector(".state");

        if (curretCardState.textContent !== "Done") {
            curretCardState.className = "state Done";
            curretCardState.textContent = "Done";
            card.className = "task Done";

            const findedTask = findTaskInArray(uid);
            findedTask.state = "Done";

            processTransaction(TRANSACTION_TYPES.CREDIT, uid, findedTask.title);
            updateTask(uid, findedTask);
            createEvent(EVENTS_TYPES.wallet_credit, uid, title, priority, state);
        }
    });
}


/* ============================================================
   EDIT MODAL — SAVE CHANGES
   Reads values from the modal, updates the card DOM and the
   task array, logs the event, then persists via API.
   ============================================================ */
editModalButton.addEventListener("click", () => {
    const modalTitle     = editTaskDialog.querySelector(".edit-modal-text-area.title").value;
    const modalDesc      = editTaskDialog.querySelector(".edit-modal-text-area.description").value;
    const modalState     = editTaskDialog.querySelector(".state:not(.inactive)");
    const modalPrio      = editTaskDialog.querySelector(".modpriority:not(.inactive)");
    const modalPrioText  = modalPrio.textContent.replace("Priority", "").trim();
    const modalStateText = modalState.textContent;

    updateCardDOM(currentCard, {
        title:       modalTitle,
        description: modalDesc,
        priority:    modalPrioText,
        state:       modalStateText,
    });

    const taskId     = currentCard.id;
    const findedTask = findTaskInArray(taskId);

    // Log "status changed" if only state/priority changed, otherwise "updated"
    if (findedTask.title === modalTitle && findedTask.description === modalDesc) {
        createEvent(EVENTS_TYPES.status_changed, findedTask.uid, modalTitle, modalPrioText, modalStateText);
    } else {
        createEvent(EVENTS_TYPES.updated, findedTask.uid, modalTitle, modalPrioText, modalStateText);
    }

    findedTask.title       = modalTitle;
    findedTask.description = modalDesc;
    findedTask.urgency     = modalPrioText;
    findedTask.state       = modalStateText;

    updateTask(taskId, findedTask);
    closeModal(editTaskDialog);
});


/* ============================================================
   EDIT MODAL — CLOSE WITHOUT SAVING
   ============================================================ */
closeModalBtn.addEventListener("click", () => closeModal(editTaskDialog));

// Close on backdrop click
editTaskDialog.addEventListener("click", (event) => {
    if (event.target === editTaskDialog) closeModal(editTaskDialog);
});

// Close on Escape key (prevent browser default)
editTaskDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault();
        closeModal(editTaskDialog);
    }
});


/* ============================================================
   ADD NEW TASK FLOW
   Opens the modal in "create" mode with default values,
   then on confirm creates the card, updates state and API.
   ============================================================ */
addNewTaskBtn.addEventListener("click", () => {
    openModalOverlay();

    const modalTitle = editTaskDialog.querySelector(".edit-modal-text-area.title");
    const modalDesc  = editTaskDialog.querySelector(".edit-modal-text-area.description");

    setActiveOption(modalStates,   "To-Do");
    setActiveOption(modalPriority, "Low");

    // Reset fields so placeholders are visible
    modalTitle.value = "";
    modalDesc.value  = "";

    addTaskModalButton.setAttribute("style", "display: block");
    editModalButton.setAttribute("style",    "display: none");

    // Title is empty so confirm button starts disabled
    document.querySelector("#add-task-modal").disabled = true;

    checkStatusCard();
    editTaskDialog.showModal();
});

addTaskModalButton.addEventListener("click", () => {
    const modalTitle    = editTaskDialog.querySelector(".edit-modal-text-area.title").value;
    const modalDesc     = editTaskDialog.querySelector(".edit-modal-text-area.description").value;
    const modalPrio     = editTaskDialog.querySelector(".modpriority:not(.inactive)");
    const modalState    = editTaskDialog.querySelector(".state:not(.inactive)").textContent;
    const modalPrioText = modalPrio.textContent.replace("Priority", "");
    const uuid          = crypto.randomUUID();
    const now           = getTimeTaskFormat();

    createDOMTask(modalTitle, modalDesc, modalPrioText, uuid, modalState, now);
    addTaskToArray(modalTitle, modalDesc, modalPrioText, uuid, modalState, now);

    createEvent(EVENTS_TYPES.created,      uuid, modalTitle, modalPrioText, modalState);
    createEvent(EVENTS_TYPES.wallet_debit, uuid, modalTitle, modalPrioText, modalState);
    processTransaction(TRANSACTION_TYPES.DEBIT, uuid, modalTitle);

    createTask(getTaskByIndex(getLength() - 1));
    closeModal(editTaskDialog);
});


/* ============================================================
   MODAL FIELD VALIDATION
   Disables confirm buttons while the title field is empty.
   Also prevents Enter key from submitting inside the title.
   ============================================================ */
modalEditTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") event.preventDefault();
});

editTaskDialog.querySelector(".edit-modal-text-area.title").addEventListener("input", (e) => {
    const isEmpty = e.target.value.trim() === "";
    document.querySelector("#close-modal").disabled     = isEmpty;
    document.querySelector("#add-task-modal").disabled  = isEmpty;
});


/* ============================================================
   MODAL STATE / PRIORITY SELECTORS
   Handles the toggle logic for the state and priority buttons.
   ============================================================ */
toggleInactive(modalPriority);
toggleInactive(modalStates);

/**
 * Makes the clicked option active and marks all siblings as inactive.
 * @param {HTMLElement} selector - The container element.
 */
function toggleInactive(selector) {
    selector.addEventListener("click", (e) => {
        const clickedDiv = e.target;
        clickedDiv.classList.remove("inactive");

        if (clickedDiv.parentElement === selector) {
            Array.from(selector.children)
                .filter(div => div !== clickedDiv)
                .forEach(el => el.classList.add("inactive"));
        }
    });
}

/**
 * Activates the option whose class matches optionClass,
 * and deactivates all other siblings.
 * @param {HTMLElement} container
 * @param {string} optionClass
 */
function setActiveOption(container, optionClass) {
    Array.from(container.children).forEach(el => {
        el.classList.toggle("inactive", !el.classList.contains(optionClass));
    });
}


/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Updates the visual state of a task card in the DOM.
 * @param {HTMLElement} card
 * @param {{ title, description, priority, state }} data
 */
function updateCardDOM(card, data) {
    card.querySelector(".task-title").textContent = data.title;
    card.querySelector(".task-desc").textContent  = data.description;

    const stateEl = card.querySelector(".state");
    stateEl.className   = `state ${data.state}`;
    stateEl.textContent = data.state;

    const priorityEl = card.querySelector(".priority");
    priorityEl.className = `priority ${data.priority}`;
    priorityEl.querySelector("div").textContent = data.priority;

    card.className = `task ${data.state}`;
}

/**
 * Disables state buttons in the modal if the current card is already Done,
 * preventing state regression.
 */
function checkStatusCard() {
    if (!currentCard) return;

    const isDone = currentCard.querySelector(".state")?.textContent.trim() === "Done";
    const modalStateButtons = editTaskDialog.querySelectorAll(".modal-state .state");

    modalStateButtons.forEach(button => {
        button.disabled    = isDone;
        button.style.cursor = isDone ? "not-allowed" : "pointer";
    });
}