// ============================================================================
// UTILS MODULE
// ============================================================================
// This module contains utility functions used across the application.
// These are general-purpose helpers that don't belong to a specific feature.
// ============================================================================


// ============================================================================
// DOM ELEMENTS
// ============================================================================

const overlay = document.querySelector('.overlay');


// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

// Closes a modal with animation and removes the overlay
export function closeModal(modal) {
    // Add closing class to trigger CSS animation
    modal.classList.add('closing');
    
    // Wait for animation to complete, then cleanup
    setTimeout(() => {
        overlay.classList.remove("open");
        modal.close();
        modal.classList.remove('closing');
        document.body.classList.remove("no-scroll");
    }, 300);
}

/*Shows the overlay backdrop, Called when opening any modal to darken the background*/
export function openModalOverlay() {
    overlay.classList.add("open");
    document.body.classList.add("no-scroll");
}

// ============================================================================
// CLEAN DOM FUNCTIONS
// ============================================================================

export async function cleanTaskBoard(){
    const taskBoard = document.querySelector(".tasks-board");
    taskBoard.innerHTML = '';
}

// ============================================================================
// DATE UTILS
// ============================================================================


// Converts timestamp string "HH:MM DD/MM" to milliseconds for comparison
export function convertDate(dateTime){
    const [time, date] = dateTime.split(" ");
    const [hours, minutes] = time.split(":");
    const [day, month] = date.split("/");
    const year = new Date().getFullYear();

    return new Date(year, month - 1, day, hours, minutes).getTime();
}


export function getTimeTaskFormat(){
    const date = new Date(Date.now());
    const hh = String(date.getHours()).padStart(2,'0');
    const min = String(date.getMinutes()).padStart(2,'0');;
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth() + 1).padStart(2,'0');
    return `${hh}:${min} ${dd}/${mm}`
}