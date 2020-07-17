//document.getElementById("loginPage").style.display = "none";
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
                <button data-action="delete" data-task-id="${task.id}" class="btn btn-danger">Delete</button>
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
      <td><button data-action="edit" data-task-id="${task.taskId}" class="btn btn-primary">Edit</button>
      <button data-action="delete" data-task-id="${task.id}" class="btn btn-danger">Delete</button>
      </td>
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

    delete(taskId){
      const task = this.tasks.find((task) => task.id == taskId);
      if (!task) return;
  
      firebase.database().ref('tasks').child(taskId).remove();
  
      const existingRow = document.querySelector(`tr[data-task-id="${task.id}"]`);
      if (!existingRow) return;
      existingRow.remove();
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
    const taskId = e.target.getAttribute("data-task-id");
    if (action == "edit") {
      taskListPage.startEdittingTask(taskId);
    } else if (action == "delete") {
      taskListPage.delete(taskId);
    }
  });
  document.getElementById("submit").addEventListener("click", (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });
  });
  document.getElementById("signIn").addEventListener("click", (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
  });
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      console.log("here");
      document.getElementById("loginPage").style.display = "none";
      document.getElementById("taskListPage").style.display = "initial";
    } else {
      document.getElementById("taskListPage").style.display = "none";
    }
  });
