class TaskManager {
  constructor() {
    this.tasks = this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem("tasks") || "[]");
  }

  saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  addTask(name) {
    this.tasks.push({ name, completed: false });
    this.saveToLocalStorage();
  }

  deleteTask(name) {
    this.tasks = this.tasks.filter((task) => task.name !== name);
    this.saveToLocalStorage();
  }

  editTask(oldName, newName) {
    const task = this.tasks.find((task) => task.name === oldName);
    if (task) {
      task.name = newName;
      this.saveToLocalStorage();
    }
  }

  toggleTaskCompleted(name) {
    const task = this.tasks.find((task) => task.name === name);
    if (task) {
      task.completed = !task.completed;
      this.saveToLocalStorage();
    }
  }

  getTasks() {
    return this.tasks;
  }

  searchTasks(query) {
    return query
      ? this.tasks.filter((task) =>
          task.name.toLowerCase().includes(query.toLowerCase())
        )
      :  this.tasks;
  }

  clearTasks() {
    this.tasks = [];
    this.saveToLocalStorage();
  }
}

const taskManager = new TaskManager();

const filterTasks = (filter, tasks) => {
  const filters = {
    completadas: (task) => task.completed,
    pendientes: (task) => !task.completed,
    todas: () => true,
  };
  return tasks.filter(filters[filter] || filters.todas);
};

const renderTasks = (tasks, filter = "todas") => {
  const taskList = document.getElementById("checklist");
  taskList.innerHTML = "";

  const filteredTasks = filterTasks(filter, tasks);

  if (filteredTasks.length === 0) {
    taskList.innerHTML =
      '<p class="main__sectionToDoS__checklist__notItem">No se encontraron tareas</p>';
    return;
  }

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement("div");
    taskItem.className = "main__sectionToDoS__checklist__item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.id = `task-${index}`;
    taskItem.appendChild(checkbox);

    const label = document.createElement("label");
    label.textContent = task.name;
    label.setAttribute("for", checkbox.id);
    taskItem.appendChild(label);

    const controls = document.createElement("div");
    controls.className = "main__sectionToDoS__checklist__item__contols";

    const editIcon = createSvgIcon(
      "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      "m15 5 4 4"
    );
    const deleteIcon = createSvgIcon(
      "M3 6h18",
      "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
      "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
      "line x1='10' x2='10' y1='11' y2='17'",
      "line x1='14' x2='14' y1='11' y2='17'"
    );

    controls.append(editIcon, deleteIcon);
    taskItem.appendChild(controls);
    taskList.appendChild(taskItem);

    checkbox.addEventListener("change", () => {
      taskManager.toggleTaskCompleted(task.name);
      renderTasks(taskManager.getTasks(), filter);
    });

    editIcon.addEventListener("click", () =>
      handleEditTask(task, label, filter)
    );
    deleteIcon.addEventListener("click", () => {
      taskManager.deleteTask(task.name);
      renderTasks(taskManager.getTasks(), filter);
    });
  });
};

const createSvgIcon = (...paths) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "#7e8590");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.classList.add("main__sectionToDoS__checklist__item__icon");
  paths.forEach((path) => (svg.innerHTML += `<path d="${path}"></path>`));
  return svg;
};

const handleEditTask = (task, label, filter) => {
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.value = task.name;
  inputField.className = "main__sectionToDoS__checklist__item__edit";

  label.replaceWith(inputField);
  inputField.focus();

  const saveEdit = () => {
    const newName = inputField.value.trim();
    if (newName && newName !== task.name) {
      taskManager.editTask(task.name, newName);
    }
    renderTasks(taskManager.getTasks(), filter);
  };

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveEdit();
  });
  inputField.addEventListener("blur", saveEdit);
};

document.getElementById("formCreateItem").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("inputCreateItem");
  const taskName = input.value.trim();
  if (
    taskName &&
    !taskManager
      .getTasks()
      .some((task) => task.name.toLowerCase() === taskName.toLowerCase())
  ) {
    taskManager.addTask(taskName);
    renderTasks(taskManager.getTasks());
    input.value = "";
  }
});

["tab1", "tab2", "tab3"].forEach((tabId) => {
  document.getElementById(tabId).addEventListener("change", (e) => {
    renderTasks(
      taskManager.getTasks(),
      e.target.id === "tab1"
        ? "todas"
        : e.target.id === "tab2"
        ? "completadas"
        : "pendientes"
    );
  });
});

document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  const activeTab = document.querySelector('input[name="tab"]:checked');

  const filter =
    {
      tab1: "todas",
      tab2: "completadas",
      tab3: "pendientes",
    }[activeTab.id] || "todas";

  const searchResults =  taskManager.searchTasks(query);
  
  renderTasks(searchResults, filter);
});

document.getElementById("btnDeleteAll").addEventListener("click", () => {
  taskManager.clearTasks();
  renderTasks(taskManager.getTasks());
});

window.addEventListener("DOMContentLoaded", () =>
  renderTasks(taskManager.getTasks())
);
