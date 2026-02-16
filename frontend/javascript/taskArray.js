// ============================================================================
// TASK ARRAY MODULE
// ============================================================================
// Manages the task array, sorting logic, and search bar functionality
// ============================================================================

import { createDOMTask } from "./app.js"; 
import { cleanTaskBoard } from "./utils.js";
import { convertDate } from "./utils.js";

// ============================================================================
// TASK ARRAY STATE
// ============================================================================

let taskArray = [];

// ============================================================================
// TASK ARRAY OPERATIONS
// ============================================================================

// Adds a new task object to the array
export function addTaskToArray(title, desc, priority, uid, state, timestamp){
    const task = {
        title: title,
        description: desc,
        urgency: priority,
        uid: uid,
        state: state,
        datetime: timestamp
    };
    taskArray.push(task);
}

// Replaces the entire task array with new data
export function setTaskArray(tasks){
    taskArray = tasks;
}

// Returns the complete task array
export function getTaskArray(){
    return taskArray;
}

// Finds and returns a task by its unique ID
export function findTaskInArray(uid){
    const index = taskArray.findIndex(t => t.uid === uid);
    return taskArray[index];
}

// Returns a task at a specific index
export function getTaskByIndex(index){
    return taskArray[index];
}

// Returns the number of tasks in the array
export function getLength(){
    return taskArray.length;
}

// ============================================================================
// SORTING & RENDERING
// ============================================================================

// Sorts tasks by: State (To-Do > Doing > Done) → Priority (High > Mid > Low) → Date (newest first)
// Then clears the board and renders all tasks in sorted order
export function renderTasks(){
    const priorityWeight = { 'High': 1, 'Mid': 2, 'Low': 3 };
    const stateWeight = { 'To-Do': 1, 'Doing': 2, 'Done': 3 };

    taskArray.sort((a, b) => {
        // Primary sort: State
        const stateDiff = stateWeight[a.state.trim()] - stateWeight[b.state.trim()];
        if(stateDiff !== 0) return stateDiff;
        
        // Secondary sort: Priority
        const urgencyDiff = priorityWeight[a.urgency.trim()] - priorityWeight[b.urgency.trim()];
        if(urgencyDiff !== 0) return urgencyDiff;

        // Tertiary sort: Timestamp (newest first)
        return convertDate(b.datetime) - convertDate(a.datetime);
    });

    // Clear board and render sorted tasks
    cleanTaskBoard();
    taskArray.forEach(task => {
        createDOMTask(task.title, task.description, task.urgency, 
                      task.uid, task.state, task.datetime);
    });
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

// Filters tasks based on search query and renders matching results
// Searches across title, description, priority, state, and timestamp
function searchQuery(query){
    const lowerQuery = query.toLowerCase();
    
    const filteredTasks = taskArray.filter(task => {
        return task.title.toLowerCase().includes(lowerQuery) ||
               task.description.toLowerCase().includes(lowerQuery) ||
               task.urgency.toLowerCase().includes(lowerQuery) ||
               task.state.toLowerCase().includes(lowerQuery) ||
               task.datetime.toLowerCase().includes(lowerQuery);
    });

    // Render filtered results without sorting to preserve search relevance
    cleanTaskBoard();
    filteredTasks.forEach(task => {
        createDOMTask(task.title, task.description, task.urgency, 
                      task.uid, task.state, task.datetime);
    });
}

// ============================================================================
// SEARCH BAR EVENT LISTENERS
// ============================================================================

const searchBar = document.querySelector(".search-bar");
let searchTimeout;

// Prevents line breaks in search bar
searchBar.addEventListener("keydown", (event) => {
    if(event.key === "Enter"){
        event.preventDefault();
    }
});

// Debounced search with 600ms delay to avoid excessive filtering
searchBar.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        if(query.length >= 2){
            searchQuery(query);
        } else {
            // Empty or single character: show all tasks sorted
            renderTasks();
        }
    }, 600);
});