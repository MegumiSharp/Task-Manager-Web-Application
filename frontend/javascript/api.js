// ============================================================================
// API MODULE
// ============================================================================
// This module handles API request
// ============================================================================

// Works automatically in both Docker (via nginx proxy) and local dev (Live Server)
const API_URL = window.location.port === '5500'
    ? 'http://127.0.0.1:8000'   // Local dev
    : '/api';                    // Docker (any other port, including 8080)
    
// ============================================================================
// TASK DATABASE REQUEST
// ============================================================================

export async function createTask(task){
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

export async function deleteTask(task_id){
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


export async function getTasks(){
    try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) throw new Error('Errore nel recupero dei task');
            return await response.json();
        } catch (error) {
            console.error('Errore:', error);
            return [];
        }
}

export async function updateTask(task_id, task){
    try{
        const response = await fetch(`${API_URL}/tasks/${task_id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(task)
        });
        
        if (!response.ok) throw new Error(`HTTP error! Status ${response.status}`);
        
        const data = await response.json();
        console.log('✅ Task aggiornato:', data.message);
        return data;
    } catch(error) {
        console.error('Errore nell\'aggiornamento del task:', error);
        alert('Errore nell\'aggiornare il task. Riprova più tardi.');
        return null;
    }
}

// ============================================================================
// TRANSACTIONS AND BALANCE DATABASE REQUEST
// ============================================================================

export async function createTransaction(transaction){
    try{
        const response = await fetch(`${API_URL}/wallet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaction)
        });

        if(!response.ok){ throw new Error(`HTTP error! Status ${response.status}`)}

        const data = await response.json();
        console.log('✅ Transaction salvata:', data.message);
        return data;
    } 
    catch(error){
        console.error('Errore nel salvataggio della transaction:', error)
        alert('Errore nel salvataggio della transaction. Riprova più tardi.');
        return null;
    }
}


export async function getTransactions(){
    try {
            const response = await fetch(`${API_URL}/wallet`);
            if (!response.ok) throw new Error('Errore nel recupero delle transactions');
            return await response.json();
        } catch (error) {
            console.error('Errore:', error);
            return [];
        }
}


// ============================================================================
// AUDIT LOG DATABASE REQUEST
// ============================================================================

export async function createEventLog(event){
    try{
        const response = await fetch(`${API_URL}/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if(!response.ok){ throw new Error(`HTTP error! Status ${response.status}`)}

        const data = await response.json();
        console.log('✅ Event saved:', data.message);
        return data;
    } 
    catch(error){
        console.error('Error saving event:', error)
        alert('Error saving event. Please try again later.');
        return null;
    }
}


export async function getEvents(){
    try {
            const response = await fetch(`${API_URL}/audit`);
            if (!response.ok) throw new Error('Error retrieving events');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
}