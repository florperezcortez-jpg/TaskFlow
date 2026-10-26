
/* ========================================
   TASKFLOW - Gestor de tareas
   ======================================== */

// Buscamos los elementos HTML que vamos a utilizar.

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");

// ========================================
// DATOS
// ========================================

// Array que contiene todas las tareas.
let tasks = [];

// Filtro que está seleccionado actualmente.
let currentFilter = "all";

// ========================================
// ALMACENAMIENTO LOCAL
// ========================================

// Guardamos las tareas en el navegador.
function saveTasks() {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

// Recuperamos las tareas guardadas.
function loadTasks() {
    const savedTasks = localStorage.getItem("taskflow-tasks");

    if (savedTasks !== null) {
        try {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks;
            }
        } catch (error) {
            console.error("Error al recuperar las tareas:", error);
            tasks = [];
        }
    }
}

// ========================================
// AGREGAR TAREAS
// ========================================

taskForm.addEventListener("submit", function (event) {

    // Evitamos que el formulario recargue la página.
    event.preventDefault();

    // Obtenemos el texto sin espacios sobrantes.
    const text = taskInput.value.trim();

    // No permitimos tareas vacías.
    if (text === "") {
        return;
    }

    // Creamos un objeto para la nueva tarea.
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    // Añadimos la tarea al array.
    tasks.push(newTask);

    // Guardamos los cambios.
    saveTasks();

    // Limpiamos el campo.
    taskInput.value = "";
    taskInput.focus();

    // Actualizamos la pantalla.
    renderTasks();
});

// ========================================
// MOSTRAR Y ACTUALIZAR TAREAS
// ========================================

function renderTasks() {

    // Vaciamos la lista visual antes de dibujarla otra vez.
    taskList.innerHTML = "";

    // Aplicamos el filtro seleccionado.
    const filteredTasks = tasks.filter(function (task) {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Creamos los elementos de cada tarea visible.
    filteredTasks.forEach(function (task) {

        const li = document.createElement("li");
        li.classList.add("task-item");

        // Casilla para completar o reactivar la tarea.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Completar " + task.text);

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });

        // Texto de la tarea.
        const span = document.createElement("span");
        span.textContent = task.text;
        span.classList.add("task-text");

        if (task.completed) {
            span.classList.add("completed");
        }
         // ========================================
// BOTÓN PARA EDITAR LA TAREA
// ========================================

const editButton = document.createElement("button");
editButton.type = "button";
editButton.textContent = "Editar";

// Cuando hacemos clic, permitimos cambiar el texto.
editButton.addEventListener("click", function () {

    // Pedimos el nuevo texto mediante una ventana del navegador.
    const newText = prompt("Editar tarea:", task.text);

    // Si cancelamos, no hacemos ningún cambio.
    if (newText === null) {
        return;
    }

    // Eliminamos los espacios sobrantes.
    const editedText = newText.trim();

    // No permitimos guardar una tarea vacía.
    if (editedText === "") {
        alert("La tarea no puede estar vacía.");
        return;
    }

    // Actualizamos el texto de la tarea.
    task.text = editedText;

    // Guardamos el cambio y actualizamos la pantalla.
    saveTasks();
    renderTasks();
});
        // Botón para eliminar la tarea.
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Eliminar";
        deleteButton.classList.add("delete-button");

        deleteButton.addEventListener("click", function () {

            // Conservamos todas las tareas excepto la eliminada.
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        // Incorporamos los elementos al <li>.
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        // Añadimos la tarea a la lista del HTML.
        taskList.appendChild(li);
    });

    // Calculamos el total de tareas pendientes.
    const pendingCount = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskCount.textContent = pendingCount === 1
        ? "1 tarea pendiente"
        : pendingCount + " tareas pendientes";

    // Mostramos el mensaje cuando no hay tareas visibles.
    emptyMessage.hidden = filteredTasks.length > 0;
}

// ========================================
// FILTROS
// ========================================

const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Leemos el filtro definido en el HTML.
        currentFilter = button.dataset.filter;

        // Actualizamos el estado visual de los botones.
        filterButtons.forEach(function (filterButton) {
            const isActive = filterButton === button;

            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", isActive);
        });

        // Dibujamos las tareas que corresponden al filtro.
        renderTasks();
    });
});

// ========================================
// INICIALIZACIÓN
// ========================================

// Recuperamos los datos antes de dibujar la lista.
loadTasks();
renderTasks();
