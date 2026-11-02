const orderDialog = document.getElementById('order-dialog');
const orderButtons = document.querySelectorAll('.product-card__button');
const closeDialogButton = document.getElementById('close-order-dialog');
const selectedProductInput = document.getElementById('selected-product');

orderButtons.forEach((button) => { // Перебираем все кнопки «Заказать».
    button.addEventListener('click', () => {
        const productName = button.dataset.product; // Получаем название товара из data-атрибута.
        selectedProductInput.value = productName; // Записываем название товара в скрытое поле формы.
        orderDialog.showModal(); // Открываем модальное окно.
    });
});
// Закрываем модальное окно по кнопке «Закрыть».
closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
});
const orderForm = document.getElementById('order-form'); // Получаем форму заявки.
const successMessage = document.getElementById('success-message'); // Получаем сообщение об успешной отправке.
orderForm.addEventListener('submit', (event) => { // Обрабатываем отправку формы.
    event.preventDefault(); // Отменяем стандартную отправку формы, потому что backend пока не подключён.
    const formElements = Array.from(orderForm.elements); // Сбрасываем предыдущие признаки ошибок.
    formElements.forEach((element) => {
        if (element.willValidate) {
            element.removeAttribute('aria-invalid');
        }
    });
    if (!orderForm.checkValidity()) { // Проверяем встроенные HTML-ограничения формы.
        formElements.forEach((element) => {
            if (element.willValidate && !element.checkValidity()) {
                element.setAttribute('aria-invalid', 'true');
            }
        });
        orderForm.reportValidity(); // Показываем стандартные сообщения браузера.
        return;
    }
    successMessage.hidden = false; // Показываем сообщение об успешной отправке.
    orderForm.reset();
    orderDialog.close();
});