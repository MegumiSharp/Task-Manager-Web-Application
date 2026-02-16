// ============================================================================
// HEADER MODALS MODULE
// ============================================================================
// This module handles all header-related modals including:
// - Audit Log: displays system events and task changes
// - Wallet/Balance: shows transaction history and current balance
// ============================================================================

import { TRANSACTION_TYPES, TRANSACTION_AMOUNT, STARTER_BALANCE } from "./config.js";
import { closeModal, openModalOverlay } from "./utils.js";
import { createTransaction, getTransactions, createEventLog, getEvents } from "./api.js";

// ============================================================================
// COMMON VARIABLES
// ============================================================================

const headerModal = document.querySelector("#auditLog-modal");
const headerModalTextArea = headerModal.querySelector(".audit-log-text-area");
const headerModalTitle = document.querySelector("#audit-log-title");

// ============================================================================
// AUDIT LOG VARIABLES
// ============================================================================

const auditLogBtn = document.querySelector(".button.audit");

let eventTracker = [];

// ============================================================================
// TRANSACTION VARIABLES
// ============================================================================

const walletText = document.querySelector(".wallet-amount");
const walletLogBtn = document.querySelector(".button.wallet");

let isAddTaskBtnDisabled =  document.querySelector(".button.add-new-task").disabled 

let walletTransactions = [];
let walletBalance = STARTER_BALANCE;
updateWalletBalanceUI();


// ============================================================================
// AUDIT LOG EVENT FUNCTIONS 
// ============================================================================

export async function setAuditLog(){
    eventTracker = await getEvents()
}

export function createEvent(type, task_id, title, priority, state){
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    const event = {
        type: type,
        timestamp: now,
        taskId: task_id,
        title: title,
        priority: priority,
        state: state,
    }

    eventTracker.push(event)
    createEventLog(event)
}

function formatAuditLog() {
    let formattedEvents = "";

    eventTracker.forEach(element => {
        formattedEvents += `
        ----------------------------------------------------------------
        [${element.timestamp}] - [${element.type}]
            Task ID: ${element.taskId}
            Title: ${element.title}
            Priority: ${element.priority}
            State: ${element.state}
        ----------------------------------------------------------------`;
    });
    return formattedEvents;
}


// ============================================================================
// EVENT LISTENERS -  AUDIT LOG
// ============================================================================

auditLogBtn.addEventListener("click", () => {
    headerModalTitle.textContent = `Audit Log - ${eventTracker.length} Events`
    // Prevent body scroll and show overlay
    document.body.classList.add("no-scroll");
    openModalOverlay();
    
    // Populate audit log content
    headerModalTextArea.textContent = formatAuditLog();
    
    // Display modal
    headerModal.showModal();
});

// ============================================================================
// TRANSACTIONS FUNCTIONS
// ============================================================================

export async function setWalletTransactions(){
    walletTransactions = await getTransactions()
    if(walletTransactions.length === 0){return} 
    
    walletBalance = walletTransactions[walletTransactions.length-1].balance;
    updateWalletBalanceUI();
}

function updateWalletBalanceUI(){
    walletText.textContent = walletBalance;
}

export function processTransaction(type, uid, title){
    let amount = 0; 
    if(type === TRANSACTION_TYPES.CREDIT){amount = TRANSACTION_AMOUNT.CREDIT}
    else if(type === TRANSACTION_TYPES.DEBIT){amount = TRANSACTION_AMOUNT.DEBIT}
    else if(type === TRANSACTION_TYPES.REFUND){amount = TRANSACTION_AMOUNT.REFUND}

    updateBalance(type, amount);
    createTransactionData(type, uid, title, String(amount));
}

function createTransactionData(type, task_id, title, amount){
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    
    
    const transaction = {
        type: type,
        timestamp: now,
        title: title,
        uid: task_id,
        balance: walletBalance,
        amount: amount
    }

    walletTransactions.push(transaction); 

    //Create transaction in the database
    createTransaction(transaction)
}

function formatTransactionLog(){
    let formattedTransaction = ""
    let neg = ""
    
    walletTransactions.forEach(element=>{
        if (element.type === TRANSACTION_TYPES.DEBIT) {neg = "-" } else {neg = "+"}
        formattedTransaction += `
        ------------------------------------------------------------------
        [ID TASK] = [${element.uid}]
        [${element.timestamp}] | [${element.type}] 
            Title: ${element.title}
            Amount: [${neg}${element.amount}]
            Balance: [${element.balance}]
        ------------------------------------------------------------------
        `
    })
    return formattedTransaction
}

function updateBalance(operation, amount){
    if (operation === TRANSACTION_TYPES.DEBIT && walletBalance === 0){
        alert("Balance cannot be negative")
        return
    }
    
    if (operation === TRANSACTION_TYPES.CREDIT || operation === TRANSACTION_TYPES.REFUND) {
        walletText.classList.add("increase");
        walletBalance += amount
        setTimeout(()=>{ walletText.classList.remove("increase");},300)
    }
    else if(operation === TRANSACTION_TYPES.DEBIT) {
        walletText.classList.add("decrease");
        walletBalance -= amount
        setTimeout(()=>{ walletText.classList.remove("decrease");},300)
    }

    if(walletBalance === 0){
        isAddTaskBtnDisabled = true;
    }else{
        isAddTaskBtnDisabled = false;
    }

    updateWalletBalanceUI();
}


// ============================================================================
// EVENT LISTENERS -  TRANSACTION BUTTON
// ============================================================================

walletLogBtn.addEventListener("click", () => {
    headerModalTitle.textContent = `Transactions Log - Balance ${walletBalance} Tokens`;
    // Prevent body scroll and show overlay
    document.body.classList.add("no-scroll");
    openModalOverlay();
    
    // Populate audit log content
    headerModalTextArea.textContent = formatTransactionLog();
    
    // Display modal
    headerModal.showModal();
});

// ============================================================================
// DEFAULT MODAL BEHAVIOR
// ============================================================================

// Close modal when clicking on backdrop
headerModal.addEventListener("click", (event) => {
    if (event.target === headerModal) {
        closeModal(headerModal);
    }
});

// Close modal when pressing Escape key (to better handle overlay)
headerModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault();
        closeModal(headerModal);
    }
});