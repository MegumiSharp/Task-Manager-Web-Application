// ============================================================================
// API MODULE
// ============================================================================
// This module handles API request
// ============================================================================

const API_URL = 'http://127.0.0.1:8000';

// ============================================================================
// TASK DATABASE REQUEST
// ============================================================================

//Save task data to the database
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
// AUDIT LOG DATABASE REQUEST
// ============================================================================



// ============================================================================
// TRANSACTIONS AND BALANCE DATABASE REQUEST
// ============================================================================
//Save task data to the database
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