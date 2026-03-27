// Todo List Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalCountEl = document.getElementById('totalCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const completedCountEl = document.getElementById('completedCount');
    
    // State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    
    // Initialize
    updateStats();
    renderTodos();
    setupEventListeners();
    
    // Event Listeners Setup
    function setupEventListeners() {
        // Add task on button click
        addBtn.addEventListener('click', addTodo);
        
        // Add task on Enter key
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        
        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update filter and render
                currentFilter = this.getAttribute('data-filter');
                renderTodos();
            });
        });
    }
    
    // Add a new todo
    function addTodo() {
        const text = todoInput.value.trim();
        
        if (text === '') {
            alert('Please enter a task!');
            todoInput.focus();
            return;
        }
        
        // Create new todo object
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to array
        todos.push(newTodo);
        
        // Save to localStorage
        saveTodos();
        
        // Clear input
        todoInput.value = '';
        todoInput.focus();
        
        // Update UI
        updateStats();
        renderTodos();
        
        // Show confirmation
        showNotification(`Task "${text}" added successfully!`);
    }
    
    // Render todos based on current filter
    function renderTodos() {
        // Clear current list
        todoList.innerHTML = '';
        
        // Filter todos
        let filteredTodos = [];
        if (currentFilter === 'all') {
            filteredTodos = todos;
        } else if (currentFilter === 'pending') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }
        
        // Show/hide empty state
        if (filteredTodos.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            // Create todo items
            filteredTodos.forEach(todo => {
                const todoItem = createTodoElement(todo);
                todoList.appendChild(todoItem);
            });
        }
    }
    
    // Create a todo element
    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" data-id="${todo.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${todo.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to the buttons
        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', function() {
            toggleTodoComplete(todo.id);
        });
        
        editBtn.addEventListener('click', function() {
            editTodo(todo.id);
        });
        
        deleteBtn.addEventListener('click', function() {
            deleteTodo(todo.id);
        });
        
        return li;
    }
    
    // Toggle todo completion status
    function toggleTodoComplete(id) {
        const todoIndex = todos.findIndex(todo => todo.id === id);
        if (todoIndex !== -1) {
            todos[todoIndex].completed = !todos[todoIndex].completed;
            saveTodos();
            updateStats();
            renderTodos();
            
            const status = todos[todoIndex].completed ? 'completed' : 'pending';
            showNotification(`Task marked as ${status}!`);
        }
    }
    
    // Edit a todo
    function editTodo(id) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        const newText = prompt('Edit your task:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            saveTodos();
            renderTodos();
            showNotification('Task updated successfully!');
        }
    }
    
    // Delete a todo
    function deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const todoIndex = todos.findIndex(todo => todo.id === id);
            if (todoIndex !== -1) {
                const deletedText = todos[todoIndex].text;
                todos.splice(todoIndex, 1);
                saveTodos();
                updateStats();
                renderTodos();
                showNotification(`Task "${deletedText}" deleted!`);
            }
        }
    }
    
    // Update statistics
    function updateStats() {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const pending = total - completed;
        
        totalCountEl.textContent = total;
        completedCountEl.textContent = completed;
        pendingCountEl.textContent = pending;
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(to right, #4a00e0, #8e2de2);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
        
        // Add CSS for animations if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Helper function to escape HTML (prevent XSS)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add some sample todos if empty
    if (todos.length === 0) {
        const sampleTodos = [
            { id: 1, text: 'Learn JavaScript basics', completed: true, createdAt: new Date().toISOString() },
            { id: 2, text: 'Build a todo list app', completed: true, createdAt: new Date().toISOString() },
            { id: 3, text: 'Add dark mode feature', completed: false, createdAt: new Date().toISOString() },
            { id: 4, text: 'Write documentation', completed: false, createdAt: new Date().toISOString() }
        ];
        
        todos = sampleTodos;
        saveTodos();
        updateStats();
        renderTodos();
    }
});