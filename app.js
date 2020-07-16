class Task {
    constructor(id, title, priorityId) {
      this.id = id;
      this.title = title;
      this.priorityId = priorityId;
    }
  }
  
  class TaskListPage {
    constructor() {
      this.tasks = [];
      this.priorities = [];
      const db = firebase.database();
      const tasksDb = db.ref("tasks");
      


      firebase.database().ref("priorities").once("value", (prioritiesSnapshot) => {
        const allPriorities = prioritiesSnapshot.val();
        Object.keys(allPriorities).forEach(priorityId => {
          const priorityData = allPriorities[priorityId];
          const priority = {
            id: priorityId,
            color: priorityData.color,
            message: priorityData.message
          };
          this.priorities.push(priority);
        });
         
    });
    console.log(this.priorities);
    firebase
        .database()
        .ref("tasks")
        .once("value", (snapshot) => {
          const allTasks = snapshot.val();
          Object.keys(allTasks).forEach((taskId) => {
            const taskData = allTasks[taskId];
            const task = new Task(taskId, taskData.title, taskData.priorityId);
            this.tasks.push(task);
  
            const taskListElement = document.getElementById("taskList");
            const row = document.createElement("tr");
            row.setAttribute("data-task-id", task.id);

            let badge = "badge-success";
            let text="Low";
            if(taskData.priorityId === "high"){
                badge = "badge-danger";
                text= this.priorities.find(priority => priority.id == task.priorityId).message;
            }
            else if(taskData.priorityId === "medium"){
                badge = "badge-warning";
                text= this.priorities.find(priority => priority.id == task.priorityId).message;
            }
            else {
                badge = "badge-success";
                text= this.priorities.find(priority => priority.id == task.priorityId).message;
            }
            
            row.innerHTML = `
              <td>${task.title}</td>
              <td>
                <button data-action="edit" data-task-id="${task.id}" class="btn btn-primary">Edit</button>
              </td>
              <td><span class="badge ${badge}">${text}</span></td>
              `;
            taskListElement.appendChild(row);
          });
        });
    }
    
    addTask(title,priorityVal) {
      //const taskId = this.tasks.length + 1;
      
      const taskId = firebase.database().ref('tasks').push().key;
      firebase.database().ref('tasks/' + taskId).set({
      title: title,
      priorityId: priorityVal,
      });
      const task = new Task(taskId, title,priorityVal);
      this.tasks.push(task);
      const taskListElement = document.getElementById("taskList");
      const row = document.createElement("tr");
      row.setAttribute("data-task-id", task.id);
      let badge ="";
      let text ="";
      if(task.priorityId === "high"){
        badge = "badge-danger";
        text= this.priorities.find(priority => priority.id == task.priorityId).message;
        console.log(this.priorities.find(priority => priority.id == task.priorityId));
        }
      else if(task.priorityId === "medium"){
        badge = "badge-warning";
        text= this.priorities.find(priority => priority.id == task.priorityId).message;
        }
      else {
        badge = "badge-success";
        text= this.priorities.find(priority => priority.id == task.priorityId).message;
        }

      row.innerHTML = `
      <td>${task.title}</td>
      <td><button data-action="edit" data-task-id="${task.taskId}" class="btn btn-primary">Edit</button></td>
      <td><span class="badge ${badge}">${text}</span></td>
      `;
      taskListElement.appendChild(row);
      document.getElementById("task").value = "";  
      
    }
  
    startEdittingTask(taskId) {
      for (let k = 0; k < this.tasks.length; k++) {
        if (this.tasks[k].id == taskId) {
          const task = this.tasks[k];
  
          const taskInputElement = document.getElementById("task");
          taskInputElement.value = task.title;
          taskInputElement.setAttribute("data-task-id", task.id);
          document.getElementById("addBtn").innerText = "Save";
        
      }
    }
}
  
    saveTaskTitle(taskId, taskTitle) {
      // this.tasks.forEach(function (task) {
      //   if (task.id == taskId) {
      //   }
      // });
  
      // const task = this.tasks.find(function (task) {
      //   if (task.id == taskId) return true;
      // });
  
      const task = this.tasks.find((task) => task.id == taskId);
      if (!task) return;
  
      task.title = taskTitle;
  
      const existingRow = document.querySelector(`tr[data-task-id="${task.id}"]`);
      if (!existingRow) return;
  
      existingRow.children[0].innerHTML = task.title;
      const taskInput = document.getElementById("task");
      taskInput.removeAttribute("data-task-id");
      taskInput.value = "";
      document.getElementById("addBtn").innerText = "Add";
      const url = "https://hw6-victoria.firebaseio.com/tasks.json";
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(task),
      })
        .then((response) => {
          response
            .json()
            .then((resData) => console.log(resData))
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
  
    }
    }
  
  const taskListPage = new TaskListPage();
  
  document.getElementById("addBtn").addEventListener("click", (e) => {
    
    const taskInputElement = document.getElementById("task");
    const taskTitle = taskInputElement.value;
    const existingTaskId = taskInputElement.getAttribute("data-task-id");

    const rbs = document.querySelectorAll('input[name="optradio"]');
            let selectedValue;
            for (const rb of rbs) {
                if (rb.checked) {
                    selectedValue = rb.value;
                    console.log(selectedValue);
                    break;
                }
            }
    if (existingTaskId) {
      taskListPage.saveTaskTitle(existingTaskId, taskTitle);
    } else {
      taskListPage.addTask(taskTitle,selectedValue);
    }
  });
  
  document.getElementById("taskList").addEventListener("click", (e) => {
    const action = e.target.getAttribute("data-action");
    if (action !== "edit") return;
  
    const taskId = e.target.getAttribute("data-task-id");
    taskListPage.startEdittingTask(taskId);
  });
  
  // function getData2(prop1, prop2) {
  
  // }
  
  // function getData(propertyHolder) {
  //     //propertyHolder.prop1
  //     //propertyHolder.prop2
  // }
  
  // function getData() {
  //     this.prop1 = "a";
  //     this.prop2 = "b";
  
  //     getData2(this.prop1, this.prop2);
  // }