const SUBJECTS = [
    'love', 'science', 'history', 'fantasy', 'mystery',
    'fiction', 'drama', 'adventure', 'poetry', 'classic',
    'horror', 'biography', 'philosophy', 'art', 'music'
];
// Функция для подбора случайного элемента массива//
function randomItem(arr) {
// Math.random() генерирует случайное число от 0 до 1
    // Умножаем на длину массива, получаем число от 0 до длины массива
    // Math.floor округляет в меньшую сторону до целого числа
    // Это число используется как индекс для получения элемента из массива
    return arr[Math.floor(Math.random() * arr.length)];
}
// Функция для формирования списка книг через API Open Library
export async function generateBooks(count = 10) {
    // Цикл до 5 попыток, если что-то пойдет не так
    for (let attempt = 0; attempt < 5; attempt++) {
        // Выбираем случайный жанр из массива SUBJECTS

        const subject = randomItem(SUBJECTS);
         // Формируем URL для запроса к API с выбранным жанром и лимитом 50 книг
        const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;
        
        // Выполняем запрос к API и ждем ответ
            const response = await fetch(url);
            // Проверяем, успешен ли запрос (свойство ok)
            if (!response.ok) continue;
             // Если нет - переходим к следующей попытке
            

            // Преобразуем ответ в JSON объект
            const data = await response.json();
            // Проверяем, есть ли свойство works и является ли оно массивом
            if (!data.works || !Array.isArray(data.works)) continue;
            // Если нет - переходим к следующей попытке

            // Формируем массив книг:
            // 1. filter - оставляем только книги с названием и хотя бы одним автором
            // 2. slice - берем первые count элементов
            // 3. map - преобразуем каждый объект в нужный формат
            const books = data.works
                .filter(book => book.title && book.authors && book.authors.length > 0)
                .slice(0, count)
                .map(book => ({
                    // Создаем объект книги в нужном формате
                        id: crypto.randomUUID(),
                        // Уникальный идентификатор через crypto.randomUUID()
                        title: book.title,
                        // Название книги
                        author: book.authors.map(a => a.name).join(', '),
                        // Имена всех авторов через запятую
                        genre: subject,
                        // Выбранный ранее жанр
                        year: book.first_publish_year || null,
                         // Год первого издания или null
                        rating: Number((Math.random() * 2 + 3).toFixed(1))
                        // Случайный рейтинг от 3 до 5 с округлением до одного знака
                    
                }));
             // Проверяем, есть ли книги в массиве
            if (books.length > 0) {
                 // Возвращаем массив книг и завершаем выполнение функции
                return books;
            }
            
        }
         // Если после всех 5 попыток не удалось получить книги - выбрасываем ошибку
    throw new Error('Не удалось сгенерировать книги');

}
