const orderDialog = document.getElementById('order-dialog');
const selectedProduct = document.getElementById('selected-product');

document.querySelectorAll('.product-card__button').forEach((button) => {
    button.addEventListener('click', () => {
        if (!orderDialog) return;
        if (selectedProduct) selectedProduct.value = button.dataset.product || '';
        orderDialog.showModal();
    });
});

document.getElementById('close-order-dialog')?.addEventListener('click', () => {
    orderDialog?.close();
});

document.querySelectorAll('.order-form').forEach((form) => {
    form.noValidate = true;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        Array.from(form.elements).forEach((element) => {
            if (!element.willValidate) return;
            element.removeAttribute('aria-invalid');
            if (!element.checkValidity()) element.setAttribute('aria-invalid', 'true');
        });
        if (!form.reportValidity()) return;
        form.reset();
        if (orderDialog?.open) orderDialog.close();
        const message = document.getElementById('success-message');
        if (message) {
            message.hidden = false;
            message.scrollIntoView({ block: 'center' });
        }
    });
});
