// ============================================================================
// HEADER MODALS MODULE
// ============================================================================
// This module handles all header-related modals including:
// - Audit Log: displays system events and task changes
// - Wallet/Balance: shows transaction history and current balance
// ============================================================================

import { TRANSACTION_TYPES } from "./config.js";
import { closeModal, openModalOverlay } from "./utils.js";


// ============================================================================
// AUDIT LOG AND TRANSACTION MODAL
// ============================================================================

const auditLogModal = document.querySelector("#auditLog-modal");
const auditLogBtn = document.querySelector(".button.audit");
const auditLogTextArea = auditLogModal.querySelector(".audit-log-text-area");


let eventTracker = [];
let walletTransactions = [];
let walletBalance = 0;

// ============================================================================
// AUDIT LOG EVENT FUNCTIONS 
// ============================================================================

export function createEvent(type, task_id, title, priority, state){
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

function formatAuditLog() {
    let formattedEvents = "";

    eventTracker.forEach(element => {
        // Filter for task-related events only
        if (element.type === "TASK_CREATED" || 
            element.type === "TASK_UPDATED" || 
            element.type === "TASK_DELETED") {
            
            formattedEvents += `
        ----------------------------------------------------------------
        [${element.timestamp}] - [${element.type}]
            Task ID: ${element.payload.taskId}
            Title: ${element.payload.title}
            Priority: ${element.payload.priority}
            State: ${element.payload.state}
        ----------------------------------------------------------------`;
        }
    });

    return formattedEvents;
}


// ============================================================================
// EVENT LISTENERS -  AUDIT LOG
// ============================================================================

auditLogBtn.addEventListener("click", () => {
    // Prevent body scroll and show overlay
    document.body.classList.add("no-scroll");
    openModalOverlay();
    
    // Populate audit log content
    auditLogTextArea.textContent = formatAuditLog();
    
    // Display modal
    auditLogModal.showModal();
});

// Close modal when clicking on backdrop
auditLogModal.addEventListener("click", (event) => {
    if (event.target === auditLogModal) {
        closeModal(auditLogModal);
    }
});

// Close modal when pressing Escape key (to better handle overlay)
auditLogModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault();
        closeModal(auditLogModal);
    }
});

// ============================================================================
// TRANSACTIONS FUNCTIONS
// ============================================================================

export function createTransaction(type, task_id, title){
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    let amount = 0;

    if(type === TRANSACTION_TYPES.CREDIT){amount = "+2"}
    else if(type === TRANSACTION_TYPES.DEBIT){amount = "-1"}
    else if(type === TRANSACTION_TYPES.REFUND){amount = "+1"}

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


export function updateWalletBalance(operation, amount){
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
