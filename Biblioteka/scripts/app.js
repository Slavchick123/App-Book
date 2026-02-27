import { generateBooks } from './scripts/bookGenerator.js';

// Получаем ссылки на элементы DOM (как на странице 10)
const tableBody = document.getElementById('table-body'); // Тело таблицы
const countEl = document.getElementById('count');       // Элемент для отображения количества книг
const searchInput = document.getElementById('search');  // Поле поиска
const form = document.getElementById('book-form');      // Форма для добавления/редактирования

// Глобальный массив для хранения книг (источник истины)
let books = [];

// Функция для загрузки книг (как на рисунке 4.4)
async function loadBooks() {
    try {
        // Пытаемся получить массив книг через generateBooks
        books = await generateBooks(10);
        // После получения книг вызываем render для отображения
        render();
    } catch (error) {
        // Если ошибка - выводим в консоль и показываем уведомление пользователю
        console.error('Ошибка:', error);
        alert('Не удалось загрузить книги');
    }
}

// Функция для отображения книг в таблице (как на странице 11)
function render() {
    // Очищаем содержимое тела таблицы
    tableBody.innerHTML = '';
    
    // Получаем текст поиска, приводим к нижнему регистру и убираем пробелы
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Фильтруем книги по названию или автору
    const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );
    
    // Перебираем отфильтрованные книги и создаем строки таблицы
    filtered.forEach(book => {
        // Создаем новую строку
        const tr = document.createElement('tr');
        // Присваиваем data-атрибут с id книги для связи DOM и данных
        tr.dataset.id = book.id;
        
        // Заполняем ячейки данными о книге
        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre || ''}</td>
            <td>${book.year !== null ? book.year : ''}</td>
            <td>${book.rating !== null ? book.rating : ''}</td>
            <td>
                <button class="edit">Редактировать</button>
                <button class="delete">Удалить</button>
            </td>
        `;
        
        // Добавляем строку в таблицу
        tableBody.appendChild(tr);
    });
    
    // Обновляем счетчик отображаемых книг
    countEl.textContent = filtered.length;
}

// Делегирование событий для таблицы (как на рисунке 4.6)
tableBody.addEventListener('click', (e) => {
    // Находим строку, на которой произошел клик
    const row = e.target.closest('tr');
    if (!row) return;
    
    // Берем id книги из data-атрибута
    const bookId = row.dataset.id;
    
    // Если нажата кнопка "Удалить"
    if (e.target.classList.contains('delete')) {
        // Показываем окно подтверждения
        if (confirm('Вы уверены?')) {
            // Удаляем книгу из массива
            books = books.filter(book => book.id !== bookId);
            // Перерисовываем таблицу
            render();
        }
    }
    
    // Если нажата кнопка "Редактировать"
    if (e.target.classList.contains('edit')) {
        // Находим книгу в массиве
        const book = books.find(b => b.id === bookId);
        if (book) {
            // Заполняем форму данными книги
            fillForm(book);
        }
    }
});

// Обработчик отправки формы (как на рисунке 4.7)
form.addEventListener('submit', (e) => {
    // Отменяем стандартную отправку формы (чтобы страница не перезагружалась)
    e.preventDefault();
    
    // Собираем данные из формы
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Функция для нормализации данных (обрезает пробелы, преобразует числа)
    function normalizeBook(data) {
        return {
            title: data.title?.trim() || '',
            author: data.author?.trim() || '',
            genre: data.genre?.trim() || '',
            year: data.year ? parseInt(data.year) : null,
            rating: data.rating ? parseFloat(data.rating) : null
        };
    }
    
    // Нормализуем данные из формы
    const bookData = normalizeBook(data);
    
    // Если есть id - редактируем существующую книгу
    if (data.id) {
        const existingBook = books.find(b => b.id === data.id);
        if (existingBook) {
            // Обновляем данные книги
            Object.assign(existingBook, bookData);
        }
    } else {
        // Если нет id - создаем новую книгу
        const newBook = {
            id: crypto.randomUUID(),
            ...bookData
        };
        books.push(newBook);
    }
    
    // Сбрасываем форму и очищаем поле id
    form.reset();
    form.elements['id'].value = '';
    
    // Перерисовываем таблицу
    render();
});

// Функция для заполнения формы данными книги (как на рисунке 4.8)
function fillForm(book) {
    // Заполняем поля формы значениями из объекта книги
    form.elements['id'].value = book.id || '';
    form.elements['title'].value = book.title || '';
    form.elements['author'].value = book.author || '';
    form.elements['genre'].value = book.genre || '';
    form.elements['year'].value = book.year ?? '';
    form.elements['rating'].value = book.rating ?? '';
}

// Обработчик для поля поиска (как на рисунке 4.9)
searchInput.addEventListener('input', render);

// Обработчик для кнопки экспорта в JSON (как на рисунке 4.9)
document.getElementById('export').addEventListener('click', () => {
    // Преобразуем массив книг в JSON-строку
    const jsonString = JSON.stringify(books, null, 2);
    // Создаем Blob объект для скачивания файла
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания и кликаем по ней
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books.json';
    a.click();
    
    // Очищаем временный URL
    URL.revokeObjectURL(url);
});

// Обработчик для кнопки обновления (как на рисунке 4.4)
document.getElementById('reload').addEventListener('click', loadBooks);

// Загружаем книги при старте приложения (как на рисунке 4.9)
loadBooks();