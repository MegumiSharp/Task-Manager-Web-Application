export const TRANSACTION_TYPES ={
    CREDIT : "✅ Credit",
    DEBIT : "❌ Debit",
    REFUND : "💰 Refund"
}

//Price of transaction
export const TRANSACTION_AMOUNT ={
    CREDIT : +2,
    DEBIT : 1,
    REFUND : +1
}

export const EVENTS_TYPES = {
    created: '✅ TASK CREATED',
    updated: '🔄 TASK UPDATED',
    deleted: '❌ TASK DELETED',
    status_changed: '🔄 TASK STATUS CHANGED',
    wallet_debit: '🔴 WALLET DEBIT',
    wallet_credit: '🟢 WALLET CREDIT'
};

//Wallet Balance at the start of the application
export const STARTER_BALANCE = 100;