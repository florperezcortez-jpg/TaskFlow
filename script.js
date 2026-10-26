
/* ========================================
   TASKFLOW - Tareas y calendario
   ======================================== */

// Elementos HTML.
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskDateInput = document.querySelector("#task-date");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");

const calendarTitle = document.querySelector("#calendar-title");
const calendarGrid = document.querySelector("#calendar-grid");
const selectedDateLabel = document.querySelector("#selected-date-label");
const prevMonthButton = document.querySelector("#prev-month");
const nextMonthButton = document.querySelector("#next-month");

// ========================================
// DATOS
// ========================================

let tasks = [];
let currentFilter = "all";

// Convierte una fecha a formato YYYY-MM-DD usando la fecha local.
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = getLocalDateString(new Date());

// Día seleccionado en el calendario.
let selectedDate = today;

// Mes mostrado en el calendario.
let displayedMonth = new Date();
displayedMonth.setDate(1);

// ========================================
// ALMACENAMIENTO LOCAL
// ========================================

// Guarda todas las tareas en el navegador.
function saveTasks() {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

// Recupera las tareas guardadas.
function loadTasks() {
    const savedTasks = localStorage.getItem("taskflow-tasks");

    if (savedTasks === null) return;

    try {
        const parsedTasks = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
            // Conserva las tareas antiguas que no tenían fecha.
            tasks = parsedTasks.map(function (task) {
                return {
                    ...task,
                    date: task.date || ""
                };
            });
        }
    } catch (error) {
        console.error("Error al recuperar las tareas:", error);
        tasks = [];
    }
}

// ========================================
// AGREGAR TAREAS
// ========================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") return;

    // Creamos la tarea con fecha opcional.
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        date: taskDateInput.value
    };

    tasks.push(newTask);

    // Si se asignó una fecha, seleccionamos ese día.
    if (newTask.date) {
        selectedDate = newTask.date;

        const parts = selectedDate.split("-").map(Number);
        displayedMonth = new Date(parts[0], parts[1] - 1, 1);
    }

    saveTasks();

    // Limpiamos los campos.
    taskInput.value = "";
    taskDateInput.value = "";

    renderCalendar();
    renderTasks();

    taskInput.focus();
});

// ========================================
// MOSTRAR Y ACTUALIZAR TAREAS
// ========================================

function renderTasks() {
    taskList.innerHTML = "";

    // Las tareas con fecha aparecen solo en su día.
    // Las tareas sin fecha aparecen todos los días.
    const filteredTasks = tasks.filter(function (task) {
        const matchesDate = !task.date || task.date === selectedDate;

        if (!matchesDate) {
            return false;
        }

        // Aplicamos el filtro seleccionado.
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Creamos visualmente cada tarea.
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
            renderCalendar();
        });

        // Texto de la tarea.
        const span = document.createElement("span");
        span.textContent = task.text;
        span.classList.add("task-text");

        if (task.completed) {
            span.classList.add("completed");
        }

        li.appendChild(checkbox);
        li.appendChild(span);

        // Indicamos cuándo una tarea no tiene fecha.
        if (!task.date) {
            const dateLabel = document.createElement("small");
            dateLabel.textContent = "Sin fecha";
            dateLabel.classList.add("task-date-label");
            li.appendChild(dateLabel);
        }

        // Botón para editar el texto de la tarea.
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Editar";

        editButton.addEventListener("click", function () {
            const newText = prompt("Editar tarea:", task.text);

            if (newText === null) return;

            const editedText = newText.trim();

            if (editedText === "") {
                alert("La tarea no puede estar vacía.");
                return;
            }

            task.text = editedText;

            saveTasks();
            renderTasks();
        });

        // Botón para eliminar la tarea.
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Eliminar";
        deleteButton.classList.add("delete-button");

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
            renderCalendar();
        });

        li.appendChild(editButton);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    // Contamos todas las tareas pendientes.
    const pendingCount = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskCount.textContent = pendingCount === 1
        ? "1 tarea pendiente"
        : pendingCount + " tareas pendientes";

    // Mensaje cuando no hay tareas para mostrar.
    emptyMessage.hidden = filteredTasks.length > 0;

    if (filteredTasks.length === 0) {
        emptyMessage.textContent =
            "No hay tareas para este día. Podés agregar una o elegir otra fecha.";
    } else {
        emptyMessage.textContent =
            "Todavía no hay tareas. Agregá la primera.";
    }
}

// ========================================
// FILTROS
// ========================================

const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        // Actualizamos el botón activo.
        filterButtons.forEach(function (filterButton) {
            const isActive = filterButton === button;

            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", isActive);
        });

        renderTasks();
    });
});

// ========================================
// CALENDARIO MENSUAL
// ========================================

function renderCalendar() {
    calendarGrid.innerHTML = "";

    // Mostramos el mes y el año.
    const monthName = displayedMonth.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric"
    });

    calendarTitle.textContent =
        monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Mostramos la fecha seleccionada.
    const selectedParts = selectedDate.split("-").map(Number);

    const selectedDateObject = new Date(
        selectedParts[0],
        selectedParts[1] - 1,
        selectedParts[2]
    );

    selectedDateLabel.textContent =
        "Tareas del " + selectedDateObject.toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    // Calculamos el día de la semana en que comienza el mes.
    // La semana empieza el lunes.
    const firstWeekday = new Date(year, month, 1).getDay();
    const startingOffset = (firstWeekday + 6) % 7;

    // Calculamos cuántos días tiene el mes.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Añadimos espacios antes del primer día.
    for (let i = 0; i < startingOffset; i++) {
        const emptyCell = document.createElement("span");
        emptyCell.setAttribute("aria-hidden", "true");
        calendarGrid.appendChild(emptyCell);
    }

    // Creamos un botón para cada día.
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = getLocalDateString(
            new Date(year, month, day)
        );

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.textContent = day;
        dayButton.classList.add("calendar-day");

        // Destacamos el día seleccionado.
        const isSelected = dateString === selectedDate;

        if (isSelected) {
            dayButton.classList.add("selected");
        }

        dayButton.setAttribute("aria-pressed", String(isSelected));

        // Destacamos la fecha actual.
        if (dateString === today) {
            dayButton.classList.add("today");
        }

        // Marcamos los días que tienen tareas con fecha.
        const hasTasks = tasks.some(function (task) {
            return task.date === dateString;
        });

        if (hasTasks) {
            dayButton.classList.add("has-tasks");
        }

        // Al elegir un día, actualizamos calendario y lista.
        dayButton.addEventListener("click", function () {
            selectedDate = dateString;

            renderCalendar();
            renderTasks();
        });

        calendarGrid.appendChild(dayButton);
    }
}

// Botón para ir al mes anterior.
prevMonthButton.addEventListener("click", function () {
    displayedMonth.setMonth(displayedMonth.getMonth() - 1);
    renderCalendar();
});

// Botón para ir al mes siguiente.
nextMonthButton.addEventListener("click", function () {
    displayedMonth.setMonth(displayedMonth.getMonth() + 1);
    renderCalendar();
});

// ========================================
// INICIALIZACIÓN
// ========================================

// Recuperamos las tareas antes de mostrarlas.
loadTasks();
renderCalendar();
renderTasks();
