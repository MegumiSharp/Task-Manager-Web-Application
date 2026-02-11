
/*Create placeholder for tasks*/
function addEmptyTask(taskNum){
    const taskboard = document.querySelector(".tasks-board");

    for (let i= 0; i < taskNum; i++){
        const task = document.createElement('div')
        task.classList.add('empty-task');

        taskboard.appendChild(task);
    }
}

addEmptyTask(12);