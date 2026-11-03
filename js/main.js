const orderDialog = document.getElementById('order-dialog');
const selectedProduct = document.getElementById('selected-product');
let dialogTrigger = null;

// Native dialog provides focus containment and Escape handling.
document.querySelectorAll('.product-card__button').forEach((button) => {
    button.addEventListener('click', () => {
        if (!orderDialog) return;
        dialogTrigger = button;
        if (selectedProduct) selectedProduct.value = button.dataset.product || '';
        orderDialog.showModal();
        orderDialog.querySelector('input:not([type="hidden"])')?.focus();
    });
});
// Keep Tab and Shift+Tab cycling through controls in the open dialog.
orderDialog?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(orderDialog.querySelectorAll('button, input:not([type="hidden"]), select, textarea, a[href], [tabindex="0"]'))
        .filter((element) => !element.disabled && element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
    }
});
document.getElementById('close-order-dialog')?.addEventListener('click', () => orderDialog?.close());
orderDialog?.addEventListener('close', () => {
    if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
});

document.querySelector('.skip-link')?.addEventListener('click', () => {
    document.getElementById('main')?.focus();
});

document.querySelectorAll('.order-form').forEach((form) => {
    const fields = Array.from(form.elements).filter((field) => field.willValidate && field.tagName !== 'BUTTON');
    const summary = form.querySelector('.form-errors');
    let submitted = false;
    form.noValidate = true;

    fields.forEach((field) => {
        const error = document.createElement('p');
        error.id = `${field.id}-error`;
        error.className = 'form-error';
        error.hidden = true;
        field.closest('.order-form__field').append(error);
        const descriptions = field.getAttribute('aria-describedby') || '';
        field.setAttribute('aria-describedby', `${descriptions} ${error.id}`.trim());
    });

    function validate(field) {
        const error = document.getElementById(`${field.id}-error`);
        let message = '';
        if (field.validity.valueMissing) {
            message = field.type === 'checkbox' ? 'Подтвердите согласие на обработку данных.' : 'Заполните обязательное поле.';
        } else if (field.validity.typeMismatch) {
            message = 'Введите e-mail в формате name@example.com.';
        } else if (field.validity.patternMismatch) {
            message = 'Введите телефон в формате +7 (900) 000-00-00.';
        } else if (field.validity.tooShort) {
            message = 'Введите не менее двух символов.';
        } else if (!field.validity.valid) {
            message = 'Проверьте значение поля.';
        } else if (field.name === 'name' && field.value.trim().length < 2) {
            message = 'Введите имя: не менее двух символов, кроме пробелов.';
        }
        error.textContent = message;
        error.hidden = !message;
        if (message) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
        return !message;
    }

    function updateSummary(count) {
        summary.hidden = count === 0;
        summary.textContent = count ? `Проверьте форму. Полей с ошибками: ${count}. Пояснения указаны под полями.` : '';
    }

    fields.forEach((field) => {
        const revalidate = () => {
            if (!submitted) return;
            validate(field);
            updateSummary(fields.filter((item) => item.getAttribute('aria-invalid') === 'true').length);
        };
        field.addEventListener('input', revalidate);
        field.addEventListener('change', revalidate);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitted = true;
        const invalid = fields.filter((field) => !validate(field));
        updateSummary(invalid.length);
        const message = document.getElementById('success-message');
        if (message) message.textContent = '';
        if (invalid.length) {
            invalid[0].focus();
            return;
        }
        form.reset();
        submitted = false;
        if (orderDialog?.open) orderDialog.close();
        if (message) message.textContent = 'Заявка проверена. Это учебная форма: данные на сервер не отправляются.';
    });
});

// При выключенном JavaScript меню остаётся доступным целиком.
const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('site-menu');
const wideMenu = window.matchMedia('(min-width: 768px)');
function setMenu(open) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Закрыть меню' : 'Меню';
}
function syncMenu() {
    const focusInside = menu.contains(document.activeElement);
    const focusButton = document.activeElement === menuButton;
    menuButton.hidden = wideMenu.matches;
    setMenu(wideMenu.matches);
    if (!wideMenu.matches && focusInside) menuButton.focus();
    if (wideMenu.matches && focusButton) menu.querySelector('a')?.focus();
}
if (menuButton && menu) {
    syncMenu();
    wideMenu.addEventListener('change', syncMenu);
    menuButton.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !wideMenu.matches) {
            setMenu(false);
            menuButton.focus();
        }
    });
}
const filterDetails = document.querySelector('.filter-disclosure');
if (filterDetails) {
    const wideFilters = window.matchMedia('(min-width: 1024px)');
    const syncFilters = () => {
        const focusInside = filterDetails.contains(document.activeElement);
        filterDetails.open = wideFilters.matches;
        if (!wideFilters.matches && focusInside) filterDetails.querySelector('summary').focus();
    };
    syncFilters();
    wideFilters.addEventListener('change', syncFilters);
    const filterForm = document.querySelector('.filters-form');
    const cards = Array.from(document.querySelectorAll('.catalog-products .product-card'));
    const low = document.getElementById('price-from');
    const high = document.getElementById('price-to');
    const category = document.getElementById('filter-category');
    const error = document.getElementById('filter-error');
    low.setAttribute('aria-describedby', 'filter-error');
    high.setAttribute('aria-describedby', 'filter-error');
    function clearError() {
        error.hidden = true;
        error.textContent = '';
        low.removeAttribute('aria-invalid');
        high.removeAttribute('aria-invalid');
    }
    [low, high].forEach((field) => field.addEventListener('input', clearError));
    function applyFilters() {
        clearError();
        const min = low.value === '' ? 0 : Number(low.value);
        const max = high.value === '' ? Infinity : Number(high.value);
        if (min > max) {
            error.textContent = 'Цена «От» не должна быть больше цены «До».';
            error.hidden = false;
            low.setAttribute('aria-invalid', 'true');
            low.focus();
            return;
        }
        let count = 0;
        cards.forEach((card) => {
            const match = (category.value === 'all' || card.dataset.category === category.value)
                && Number(card.dataset.price) >= min && Number(card.dataset.price) <= max;
            card.hidden = !match;
            if (match) count++;
        });
        document.getElementById('filter-status').textContent = `Найдено товаров: ${count}`;
        document.getElementById('filter-empty').hidden = count > 0;
    }
    filterForm.addEventListener('submit', (event) => { event.preventDefault(); applyFilters(); });
    filterForm.addEventListener('reset', () => setTimeout(applyFilters, 0));
}
