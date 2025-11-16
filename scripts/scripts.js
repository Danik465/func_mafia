// Константа для пути к изображениям по умолчанию
const DEFAULT_IMAGE_PATH = 'default';

// Пути к иконкам ролей и статусов
const roleIcons = {
    sheriff: "Roles/Шериф.svg",
    don: "Roles/Дон.svg"
};

const statusIcons = {
    voted: "icons/vote.svg",
    shot: "icons/kill.svg",
    removed: "icons/delete.svg"
};

// Пути к изображениям карточек мафии
const mafiaCardImages = {
    red: "icons/Red.svg",
    redCard: "RedCards/RedCard.svg",
    blackCard: "BlackCards/BlackCard.svg",
    gray: "icons/Grey.svg",
    yellow: "icons/Yellow.svg"
};

// Путь к иконке черной карты
const blackCardIconPath = "Roles/Мафия.svg";

// ДОБАВЛЕНО: Глобальные переменные для отслеживания состояния
window.selectedRoles = {};
window.selectedColors = {};
window.sheriffCount = 0;
window.donCount = 0;
// ДОБАВЛЕНО: Для хранения количества серых карточек
window.grayCardsCount = {};

document.addEventListener('DOMContentLoaded', function() {
    // Объект для хранения элементов с именами игроков
    const nameElements = {};

    // Флаг для отслеживания выбора цвета для каждой плашки
    const hasColorSelected = {};

    // Объект для хранения выбранных карточек мафии для каждой плашки
    const selectedMafiaCards = {};

    // Функция для инициализации плашек
    function initializeCards() {
        for (let i = 1; i <= 10; i++) {
            const card = document.getElementById(`card-${i}`);
            const defaultImage = card.querySelector('.default-image');
            const blackCardIcon = document.getElementById(`black-card-icon-${i}`);

            // Проверяем существование элементов перед работой с ними
            if (!card || !defaultImage || !blackCardIcon) {
                console.warn(`Элементы для карточки ${i} не найдены, пропускаем`);
                continue;
            }

            // Устанавливаем номер плашки
            const cardNumber = card.querySelector('.card-number');
            if (cardNumber) {
                cardNumber.textContent = i;
            }
            
            // Устанавливаем изображение по умолчанию
            defaultImage.src = `${DEFAULT_IMAGE_PATH}.png`;
            defaultImage.style.display = 'block';
            hasColorSelected[i] = false;
            
            // Устанавливаем иконку черной карты
            blackCardIcon.src = blackCardIconPath;
            blackCardIcon.style.display = 'none';
            
            // Инициализируем объект для хранения карточек мафии
            selectedMafiaCards[i] = {
                red: false,
                gray: 0, // ИЗМЕНЕНО: теперь храним количество серых карточек
                yellow: false
            };
            
            // ИСПРАВЛЕНИЕ: Создаем элемент для отображения имени, если его еще нет
            let nameElement = nameElements[i];
            if (!nameElement) {
                nameElement = document.createElement('div');
                nameElement.className = 'player-name';
                // ИСПРАВЛЕНИЕ: Добавляем имя в правильный контейнер
                card.appendChild(nameElement);
                nameElements[i] = nameElement;
            }
            
            // Создаем контейнер для карточек мафии
            let mafiaContainer = document.getElementById(`mafia-container-${i}`);
            if (!mafiaContainer) {
                mafiaContainer = document.createElement('div');
                mafiaContainer.className = 'mafia-cards-container';
                mafiaContainer.id = `mafia-container-${i}`;
                card.appendChild(mafiaContainer);
            }
            
            // ИСПРАВЛЕНИЕ: Создаем три карточки разных цветов (изображения) с индивидуальными контейнерами
            for (const cardType of ['red', 'gray', 'yellow']) {
                // Создаем контейнер для каждой карточки
                const cardWrapper = document.createElement('div');
                cardWrapper.className = `mafia-card-wrapper mafia-card-wrapper-${cardType}`;
                cardWrapper.id = `mafia-wrapper-${cardType}-${i}`;
                
                const cardElementId = `mafia-card-${cardType}-${i}`;
                let mafiaCard = document.getElementById(cardElementId);
                
                if (!mafiaCard) {
                    mafiaCard = document.createElement('img');
                    mafiaCard.className = 'mafia-card';
                    mafiaCard.id = cardElementId;
                    mafiaCard.src = mafiaCardImages[cardType];
                    mafiaCard.alt = `${cardType} card`;
                    mafiaCard.style.display = 'none';
                    
                    // ДОБАВЛЕНО: Для серой карточки создаем отдельный контейнер со счетчиком
                    if (cardType === 'gray') {
                        const grayCounter = document.createElement('div');
                        grayCounter.className = 'gray-card-counter';
                        grayCounter.id = `gray-counter-${i}`;
                        grayCounter.textContent = '0';
                        grayCounter.style.display = 'none';
                        
                        cardWrapper.appendChild(mafiaCard);
                        cardWrapper.appendChild(grayCounter);
                    } else {
                        cardWrapper.appendChild(mafiaCard);
                    }
                    
                    mafiaContainer.appendChild(cardWrapper);
                }
            }
            
            // Запускаем анимацию появления плашки
            setTimeout(() => {
                card.classList.add('animate');
            }, i * 100);
        }
    }

    // Функция для проверки совместимости роли и цвета карточки
    function canSelectColor(cardId, color) {
        const errorElement = document.getElementById('role-error');
        const currentRole = window.selectedRoles[cardId];
        
        // ИСПРАВЛЕНИЕ: Добавлена проверка на существующую роль при выборе цвета
        if (currentRole === 'sheriff' && color === 'black') {
            if (errorElement) {
                errorElement.textContent = 'Шериф не может быть черной картой!';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
            return false;
        }
        
        if (currentRole === 'don' && color === 'red') {
            if (errorElement) {
                errorElement.textContent = 'Дон не может быть красной картой!';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
            return false;
        }
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }

    // Функция для анимации плашки
    function animateCard(cardId) {
        const card = document.getElementById(`card-${cardId}`);
        if (card) {
            card.classList.remove('animate');
            setTimeout(() => {
                card.classList.add('animate');
            }, 10);
        }
    }

    // Функция для анимации иконки черной карты
    function animateBlackCardIcon(cardId) {
        const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
        if (blackCardIcon) {
            blackCardIcon.classList.remove('animate');
            setTimeout(() => {
                blackCardIcon.classList.add('animate');
            }, 10);
        }
    }

    // Функция для проверки, можно ли назначить роль
    function canAssignRole(role, cardId) {
        const errorElement = document.getElementById('role-error');
        
        // ИСПРАВЛЕНИЕ: Улучшена проверка на количество ролей
        if (role === 'sheriff') {
            if (window.sheriffCount > 0 && window.selectedRoles[cardId] !== 'sheriff') {
                if (errorElement) {
                    errorElement.textContent = 'Шериф уже выбран! Можно выбрать только одного шерифа.';
                    errorElement.style.display = 'block';
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                    }, 3000);
                }
                return false;
            }
        } else if (role === 'don') {
            if (window.donCount > 0 && window.selectedRoles[cardId] !== 'don') {
                if (errorElement) {
                    errorElement.textContent = 'Дон уже выбран! Можно выбрать только одного дона.';
                    errorElement.style.display = 'block';
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                    }, 3000);
                }
                return false;
            }
        }
        
        // ИСПРАВЛЕНИЕ: Добавлена проверка совместимости роли с выбранным цветом
        const currentColor = window.selectedColors[cardId];
        if (currentColor) {
            if (role === 'sheriff' && currentColor === 'black') {
                if (errorElement) {
                    errorElement.textContent = 'Шериф не может быть черной картой! Сначала измените цвет карты.';
                    errorElement.style.display = 'block';
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                    }, 3000);
                }
                return false;
            }
            if (role === 'don' && currentColor === 'red') {
                if (errorElement) {
                    errorElement.textContent = 'Дон не может быть красной картой! Сначала измените цвет карты.';
                    errorElement.style.display = 'block';
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                    }, 3000);
                }
                return false;
            }
        }
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }

    // Функция для обновления счетчиков ролей
    function updateRoleCounters() {
        window.sheriffCount = 0;
        window.donCount = 0;
        
        for (const cardId in window.selectedRoles) {
            if (window.selectedRoles[cardId] === 'sheriff') {
                window.sheriffCount++;
            } else if (window.selectedRoles[cardId] === 'don') {
                window.donCount++;
            }
        }
    }

    // Функция для отображения роли на плашке
    function showRoleIcon(cardId, role) {
        const roleIcon = document.getElementById(`role-icon-${cardId}`);
        if (!roleIcon) return;
        
        // Устанавливаем правильный src для иконки
        roleIcon.src = roleIcons[role];
        roleIcon.style.display = 'block';
        roleIcon.classList.remove('animate');
        setTimeout(() => {
            roleIcon.classList.add('animate');
        }, 10);
        
        // Если роль - Дон, скрываем иконку черной карты
        if (role === 'don') {
            const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
            if (blackCardIcon) {
                blackCardIcon.style.display = 'none';
            }
        }
    }

    // Функция для сброса отдельной плашки
    function resetSingleCard(cardId) {
        const card = document.getElementById(`card-${cardId}`);
        if (!card) return;
        
        const defaultImage = card.querySelector('.default-image');
        const roleIcon = document.getElementById(`role-icon-${cardId}`);
        const statusIcon = document.getElementById(`status-icon-${cardId}`);
        const nameElement = nameElements[cardId];
        const nameInput = document.querySelector(`.name-input[data-card="${cardId}"]`);
        const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
        
        // ДОБАВЛЕНО: Сбрасываем выделение кнопок статуса
        const statusButtons = document.querySelectorAll(`.status-button[data-card="${cardId}"]`);
        statusButtons.forEach(btn => btn.classList.remove('selected'));

        // Восстанавливаем номер плашки
        const cardNumber = card.querySelector('.card-number');
        if (cardNumber) {
            cardNumber.textContent = cardId;
        }

        // Восстанавливаем изображение по умолчанию
        if (defaultImage) {
            defaultImage.src = `${DEFAULT_IMAGE_PATH}.png`;
            defaultImage.style.display = 'block';
        }
        hasColorSelected[cardId] = false;

        // ИСПРАВЛЕНИЕ: Сбрасываем выбранный цвет в глобальном состоянии
        window.selectedColors[cardId] = null;

        // Сбрасываем состояние статуса
        card.classList.remove('voted', 'shot', 'removed');
        if (nameElement) {
            nameElement.classList.remove('voted', 'shot', 'removed');
        }
        if (roleIcon) {
            roleIcon.classList.remove('voted', 'shot', 'removed');
        }
        if (blackCardIcon) {
            blackCardIcon.classList.remove('voted', 'shot', 'removed');
        }

        // Сбрасываем имя
        if (nameInput) {
            nameInput.value = '';
        }
        if (nameElement) {
            nameElement.textContent = '';
            nameElement.style.display = 'none';
        }
        
        // Сбрасываем роль в глобальном состоянии
        if (window.selectedRoles[cardId]) {
            const previousRole = window.selectedRoles[cardId];
            if (previousRole === 'sheriff') {
                window.sheriffCount--;
            } else if (previousRole === 'don') {
                window.donCount--;
            }
            delete window.selectedRoles[cardId];
        }
        if (roleIcon) {
            roleIcon.style.display = 'none';
            roleIcon.classList.remove('animate', 'voted', 'shot', 'removed');
        }
        
        // Сбрасываем статус
        if (statusIcon) {
            statusIcon.style.display = 'none';
        }
        
        // Сбрасываем карточки мафии
        const mafiaCards = card.querySelectorAll('.mafia-card');
        mafiaCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Сбрасываем состояние карточек мафии
        selectedMafiaCards[cardId] = {
            red: false,
            gray: 0, // ИЗМЕНЕНО: сбрасываем счетчик серых карточек
            yellow: false
        };
        
        // ДОБАВЛЕНО: Сбрасываем счетчик серых карточек
        window.grayCardsCount[cardId] = 0;
        const grayCounter = document.getElementById(`gray-counter-${cardId}`);
        if (grayCounter) {
            grayCounter.textContent = '0';
            grayCounter.style.display = 'none';
        }
        
        // Сбрасываем иконку черной карты
        if (blackCardIcon) {
            blackCardIcon.style.display = 'none';
            blackCardIcon.classList.remove('animate', 'voted', 'shot', 'removed');
        }
        
        // Снимаем выделение со всех кнопок, связанных с этой плашкой
        const allButtonsForCard = document.querySelectorAll(`
            .control-button[data-card="${cardId}"],
            .role-button[data-card="${cardId}"],
            .status-button[data-card="${cardId}"],
            .card-button[data-card="${cardId}"]
        `);
        allButtonsForCard.forEach(button => button.classList.remove('selected'));
        
        // Запускаем анимацию сброса
        card.classList.remove('animate');
        setTimeout(() => {
            card.classList.add('animate');
        }, 10);
    }

    // Инициализация плашек
    initializeCards();

    // Обработчики для ввода имен
    const nameInputs = document.querySelectorAll('.name-input');
    nameInputs.forEach(input => {
        let previousValue = '';
        
        input.addEventListener('input', function() {
            const cardId = this.getAttribute('data-card');
            const enteredName = this.value;
            const nameElement = nameElements[cardId];
            
            if (!nameElement) return;
            
            // Обновляем имя игрока
            if (enteredName) {
                nameElement.textContent = enteredName;
                nameElement.style.display = 'block';
                nameElement.classList.add('animate');
            } else {
                nameElement.textContent = '';
                nameElement.style.display = 'none';
            }
            
            // Запускаем анимацию плашки только при появлении/исчезновении имени
            if ((previousValue === '' && enteredName !== '') || 
                (previousValue !== '' && enteredName === '')) {
                animateCard(cardId);
            }
            
            previousValue = enteredName;
        });
    });

    // Функция для установки цвета плашки
    function setCardColor(cardId, color) {
        const card = document.getElementById(`card-${cardId}`);
        const defaultImage = card?.querySelector('.default-image');
        const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);

        if (!card || !defaultImage) return;

        // Устанавливаем соответствующее изображение в зависимости от цвета
        if (color === 'red') {
            defaultImage.src = mafiaCardImages.redCard;
            // Скрываем иконку черной карты
            if (blackCardIcon) {
                blackCardIcon.style.display = 'none';
            }
        } else if (color === 'black') {
            defaultImage.src = mafiaCardImages.blackCard;
            // Показываем иконку черной карты только если роль не Дон
            if (window.selectedRoles[cardId] !== 'don' && blackCardIcon) {
                blackCardIcon.style.display = 'block';
                // Запускаем анимацию иконки
                animateBlackCardIcon(cardId);
            }
        }

        defaultImage.style.display = 'block';
        hasColorSelected[cardId] = true;
        window.selectedColors[cardId] = color;
        
        // Если для этой плашки есть выбранная роль, показываем ее
        if (window.selectedRoles[cardId]) {
            showRoleIcon(cardId, window.selectedRoles[cardId]);
        }

        // Запускаем анимацию для всей плашки
        animateCard(cardId);
        
        // Анимируем имя игрока, если оно есть
        const nameElement = nameElements[cardId];
        if (nameElement && nameElement.textContent) {
            nameElement.classList.remove('animate');
            setTimeout(() => {
                nameElement.classList.add('animate');
            }, 10);
        }
    }

    // Добавляем обработчики событий для всех кнопок выбора цвета
    const controlButtons = document.querySelectorAll('.control-button');

    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            const color = this.getAttribute('data-color');
            
             // Проверяем совместимость роли и цвета
            if (!canSelectColor(cardId, color)) {
                return;
            }

            // Убираем выделение с всех кнопок для этой плашки
            const allButtonsForCard = document.querySelectorAll(`.control-button[data-card="${cardId}"]`);
            allButtonsForCard.forEach(btn => btn.classList.remove('selected'));
            
            // Добавляем выделение на clicked кнопку
            this.classList.add('selected');
            // Устанавливаем цвет плашки
            setCardColor(cardId, color);
        });
    });

    // Добавляем обработчики для кнопок выбора ролей
    const roleButtons = document.querySelectorAll('.role-button');

    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            const role = this.getAttribute('data-role');
            const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
            
            // ИСПРАВЛЕНИЕ: Проверяем, можно ли назначить эту роль
            if (!canAssignRole(role, cardId)) {
                return;
            }

            // Убираем выделение с всех кнопок ролей для этой плашки
            const allRoleButtonsForCard = document.querySelectorAll(`.role-button[data-card="${cardId}"]`);
            allRoleButtonsForCard.forEach(btn => btn.classList.remove('selected'));
            
            // Добавляем выделение на clicked кнопку
            this.classList.add('selected');
            
            // Убираем предыдущую роль, если она была назначена этой плашке
            if (window.selectedRoles[cardId]) {
                const previousRole = window.selectedRoles[cardId];
                if (previousRole === 'sheriff') {
                    window.sheriffCount--;
                } else if (previousRole === 'don') {
                    window.donCount--;
                }
            }
            
            // Сохраняем выбранную роль в глобальном состоянии
            window.selectedRoles[cardId] = role;
            
            // Обновляем счетчики ролей
            updateRoleCounters();
            
            // Если выбрана роль Дон, скрываем иконку черной карты
            if (role === 'don' && blackCardIcon) {
                blackCardIcon.style.display = 'none';
            } else if (hasColorSelected[cardId] && window.selectedColors[cardId] === 'black' && blackCardIcon) {
                // Если выбрана черная карта и роль не Дон, показываем иконку
                blackCardIcon.style.display = 'block';
                animateBlackCardIcon(cardId);
            }
            
            // Если цвет уже выбран, показываем роль
            if (hasColorSelected[cardId]) {
                showRoleIcon(cardId, role);
            }
        });
    });

    // Добавляем обработчики для кнопок статусов
    const statusButtons = document.querySelectorAll('.status-button');

    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            const status = this.getAttribute('data-status');
            const card = document.getElementById(`card-${cardId}`);
            const statusIcon = document.getElementById(`status-icon-${cardId}`);
            const nameElement = nameElements[cardId];
            const roleIcon = document.getElementById(`role-icon-${cardId}`);
            const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
            
            if (!card) return;
            
            // Сохраняем текущее состояние видимости иконки черной карты
            const wasBlackCardIconVisible = blackCardIcon && blackCardIcon.style.display === 'block';
            
            // Убираем выделение с всех кнопок статусов для этой плашки
            const allStatusButtonsForCard = document.querySelectorAll(`.status-button[data-card="${cardId}"]`);
            allStatusButtonsForCard.forEach(btn => btn.classList.remove('selected'));
            
            // Добавляем выделение на clicked кнопку
            this.classList.add('selected');
            
            // Устанавливаем правильный src для иконки статуса
            if (statusIcon) {
                statusIcon.src = statusIcons[status];
            }
            
            // Устанавливаем статус плашки
            if (status === 'voted') {
                card.classList.remove('shot', 'removed');
                card.classList.add('voted');
                // Добавляем класс для имени
                if (nameElement) {
                    nameElement.classList.remove('shot', 'removed');
                    nameElement.classList.add('voted');
                }
                // Добавляем класс для иконки роли
                if (roleIcon && roleIcon.style.display === 'block') {
                    roleIcon.classList.remove('shot', 'removed');
                    roleIcon.classList.add('voted');
                }
            } else if (status === 'shot') {
                card.classList.remove('voted','removed');
                card.classList.add('shot');
                 // Добавляем класс для имени
                if (nameElement) {
                    nameElement.classList.remove('voted', 'removed');
                    nameElement.classList.add('shot');
                }
                // Добавляем класс для иконки роли
                if (roleIcon && roleIcon.style.display === 'block') {
                    roleIcon.classList.remove('voted', 'removed');
                    roleIcon.classList.add('shot');
                }
            } else if (status === 'removed') {
                card.classList.remove('voted', 'shot');
                card.classList.add('removed');
                
                // Добавляем класс для имени
                if (nameElement) {
                    nameElement.classList.remove('voted', 'shot');
                    nameElement.classList.add('removed');
                }
                // Добавляем класс для иконки роли
                if (roleIcon && roleIcon.style.display === 'block') {
                    roleIcon.classList.remove('voted', 'shot');
                    roleIcon.classList.add('removed');
                }
            }
            
            // ВОССТАНАВЛИВАЕМ видимость иконки черной карты, если она была видимой
            if (wasBlackCardIconVisible && blackCardIcon) {
                blackCardIcon.style.display = 'block';
                
                // Также применяем соответствующий класс статуса к иконке черной карты
                blackCardIcon.classList.remove('voted', 'shot', 'removed');
                blackCardIcon.classList.add(status);
            }
                        
            // Показываем значок статуса
            if (statusIcon) {
                statusIcon.style.display = 'block';
            }
            
            // Запускаем анимацию опускания плашки
            card.classList.remove('animate');
            setTimeout(() => {
                card.classList.add('status');
            }, 10);
        });
    });
    
    // Обработчики для кнопок карточек мафии
    const cardButtons = document.querySelectorAll('.card-button');

    cardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            const cardType = this.getAttribute('data-card-type');
            const card = document.getElementById(`card-${cardId}`);
            
            // ИСПРАВЛЕНИЕ: Получаем карточку через обертку
            const mafiaWrapper = document.getElementById(`mafia-wrapper-${cardType}-${cardId}`);
            const mafiaCard = mafiaWrapper ? mafiaWrapper.querySelector('.mafia-card') : null;

            if (!mafiaCard) {
                console.error(`Карточка мафии не найдена: mafia-card-${cardType}-${cardId}`);
                return;
            }
            
            // ИЗМЕНЕНО: Логика для серых карточек - увеличиваем счетчик
            if (cardType === 'gray') {
                // Инициализируем счетчик, если его нет
                if (!window.grayCardsCount[cardId]) {
                    window.grayCardsCount[cardId] = 0;
                }
                
                // Увеличиваем счетчик (максимум 3 серые карточки)
                window.grayCardsCount[cardId] = (window.grayCardsCount[cardId] + 1) % 4;
                const newCount = window.grayCardsCount[cardId];
                
                // Обновляем отображение
                if (newCount > 0) {
                    mafiaCard.style.display = 'block';
                    this.classList.add('selected');
                    
                    // ИСПРАВЛЕНИЕ: Обновляем счетчик в правильном контейнере
                    const grayCounter = document.getElementById(`gray-counter-${cardId}`);
                    if (grayCounter) {
                        grayCounter.textContent = newCount;
                        // ИЗМЕНЕНО: Показываем счетчик только при 2+ карточках
                        grayCounter.style.display = newCount >= 2 ? 'block' : 'none';
                    }
                } else {
                    mafiaCard.style.display = 'none';
                    this.classList.remove('selected');
                    
                    // Скрываем счетчик
                    const grayCounter = document.getElementById(`gray-counter-${cardId}`);
                    if (grayCounter) {
                        grayCounter.style.display = 'none';
                    }
                }
                
                // Сохраняем состояние
                selectedMafiaCards[cardId][cardType] = newCount;
            } else {
                // Для красных и желтых карточек - стандартная логика
                selectedMafiaCards[cardId][cardType] = !selectedMafiaCards[cardId][cardType];
                
                // Переключаем отображение карточки
                if (selectedMafiaCards[cardId][cardType]) {
                    mafiaCard.style.display = 'block';
                    this.classList.add('selected');
                } else {
                    mafiaCard.style.display = 'none';
                    this.classList.remove('selected');
                }
            }

            // ИЗМЕНЕНО: Добавляем анимацию при переключении
            mafiaCard.classList.remove('animate');
            setTimeout(() => {
                mafiaCard.classList.add('animate');
            }, 10);
        });
    });

// Глобальные функции для overlay.html
window.setPlayerName = function(cardId, name) {
    console.log("setPlayerName called for card", cardId, "with name:", name);
    
    // ИСПРАВЛЕНИЕ: Получаем карточку и создаем элемент имени, если его нет
    const card = document.getElementById(`card-${cardId}`);
    if (!card) {
        console.error("Card not found:", cardId);
        return;
    }
    
    // Ищем существующий элемент имени или создаем новый
    let nameElement = card.querySelector('.player-name');
    if (!nameElement) {
        nameElement = document.createElement('div');
        nameElement.className = 'player-name';
        card.appendChild(nameElement);
        console.log("Created new name element for card", cardId);
    }
    
    if (name && name.trim() !== '') {
        nameElement.textContent = name;
        nameElement.style.display = 'block';
        nameElement.classList.add('animate');
        console.log("Set name for card", cardId, "to:", name);
    } else {
        nameElement.textContent = '';
        nameElement.style.display = 'none';
        console.log("Cleared name for card", cardId);
    }
    
    // Анимируем карточку
    card.classList.remove('animate');
    setTimeout(() => {
        card.classList.add('animate');
    }, 10);
};

window.setCardColor = function(cardId, color) {
    const card = document.getElementById(`card-${cardId}`);
    const defaultImage = card?.querySelector('.default-image');
    const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);

    if (!card || !defaultImage) return;

    if (color === 'red') {
        defaultImage.src = mafiaCardImages.redCard;
        if (blackCardIcon) {
            blackCardIcon.style.display = 'none';
        }
    } else if (color === 'black') {
        defaultImage.src = mafiaCardImages.blackCard;
        if (window.selectedRoles[cardId] !== 'don' && blackCardIcon) {
            blackCardIcon.style.display = 'block';
            animateBlackCardIcon(cardId);
        }
    }

    defaultImage.style.display = 'block';
    hasColorSelected[cardId] = true;
    window.selectedColors[cardId] = color;
    
    if (window.selectedRoles[cardId]) {
        showRoleIcon(cardId, window.selectedRoles[cardId]);
    }

    animateCard(cardId);
};

window.setCardRole = function(cardId, role) {
    const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
    
    // Убираем предыдущую роль
    if (window.selectedRoles[cardId]) {
        const previousRole = window.selectedRoles[cardId];
        if (previousRole === 'sheriff') window.sheriffCount--;
        else if (previousRole === 'don') window.donCount--;
    }
    
    // Сохраняем новую роль
    window.selectedRoles[cardId] = role;
    updateRoleCounters();
    
    // Показываем/скрываем иконки
    if (role === 'don' && blackCardIcon) {
        blackCardIcon.style.display = 'none';
    } else if (hasColorSelected[cardId] && window.selectedColors[cardId] === 'black' && blackCardIcon) {
        blackCardIcon.style.display = 'block';
        animateBlackCardIcon(cardId);
    }
    
    // Показываем иконку роли
    if (hasColorSelected[cardId]) {
        showRoleIcon(cardId, role);
    }
};

window.setCardStatus = function(cardId, status) {
    const card = document.getElementById(`card-${cardId}`);
    const statusIcon = document.getElementById(`status-icon-${cardId}`);
    const nameElements = window.nameElements || {};
    const nameElement = nameElements[cardId];
    const roleIcon = document.getElementById(`role-icon-${cardId}`);
    const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
    
    if (!card) return;
    
    // Сохраняем текущее состояние видимости иконки черной карты
    const wasBlackCardIconVisible = blackCardIcon && blackCardIcon.style.display === 'block';
    
    // Устанавливаем статус
    card.classList.remove('voted', 'shot', 'removed');
    if (nameElement) {
        nameElement.classList.remove('voted', 'shot', 'removed');
    }
    if (roleIcon && roleIcon.style.display === 'block') {
        roleIcon.classList.remove('voted', 'shot', 'removed');
    }
    
    if (status === 'voted') {
        card.classList.add('voted');
        if (nameElement) nameElement.classList.add('voted');
        if (roleIcon && roleIcon.style.display === 'block') roleIcon.classList.add('voted');
    } else if (status === 'shot') {
        card.classList.add('shot');
        if (nameElement) nameElement.classList.add('shot');
        if (roleIcon && roleIcon.style.display === 'block') roleIcon.classList.add('shot');
    } else if (status === 'removed') {
        card.classList.add('removed');
        if (nameElement) nameElement.classList.add('removed');
        if (roleIcon && roleIcon.style.display === 'block') roleIcon.classList.add('removed');
    }
    
    // Устанавливаем иконку статуса
    if (statusIcon) {
        statusIcon.src = statusIcons[status];
        statusIcon.style.display = 'block';
    }
    
    // Восстанавливаем иконку черной карты
    if (wasBlackCardIconVisible && blackCardIcon) {
        blackCardIcon.style.display = 'block';
        blackCardIcon.classList.remove('voted', 'shot', 'removed');
        blackCardIcon.classList.add(status);
    }
};

window.setMafiaCard = function(cardId, cardType, visible) {
    // ИСПРАВЛЕНИЕ: Получаем карточку через обертку
    const mafiaWrapper = document.getElementById(`mafia-wrapper-${cardType}-${cardId}`);
    const mafiaCard = mafiaWrapper ? mafiaWrapper.querySelector('.mafia-card') : null;
    
    if (mafiaCard) {
        // Логика для серых карточек
        if (cardType === 'gray') {
            const count = typeof visible === 'number' ? visible : (visible ? 1 : 0);
            
            if (count > 0) {
                mafiaCard.style.display = 'block';
                mafiaCard.classList.add('animate');
                
                // ИСПРАВЛЕНИЕ: Обновляем счетчик в правильном контейнере
                const grayCounter = document.getElementById(`gray-counter-${cardId}`);
                if (grayCounter) {
                    grayCounter.textContent = count;
                    // ИЗМЕНЕНО: Показываем счетчик только при 2+ карточках
                    grayCounter.style.display = count >= 2 ? 'block' : 'none';
                }
                
                // Сохраняем количество
                window.grayCardsCount[cardId] = count;
            } else {
                mafiaCard.style.display = 'none';
                
                // Скрываем счетчик
                const grayCounter = document.getElementById(`gray-counter-${cardId}`);
                if (grayCounter) {
                    grayCounter.style.display = 'none';
                }
                
                // Сбрасываем количество
                window.grayCardsCount[cardId] = 0;
            }
        } else {
            // Для красных и желтых карточек - стандартная логика
            if (visible) {
                mafiaCard.style.display = 'block';
                mafiaCard.classList.add('animate');
            } else {
                mafiaCard.style.display = 'none';
            }
        }
    }
};

window.resetSingleCard = function(cardId) {
    const card = document.getElementById(`card-${cardId}`);
    if (!card) return;
    
    const defaultImage = card.querySelector('.default-image');
    const roleIcon = document.getElementById(`role-icon-${cardId}`);
    const statusIcon = document.getElementById(`status-icon-${cardId}`);
    const nameElements = window.nameElements || {};
    const nameElement = nameElements[cardId];
    const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
    
    // Сбрасываем изображение по умолчанию
    if (defaultImage) {
        defaultImage.src = `${DEFAULT_IMAGE_PATH}.png`;
        defaultImage.style.display = 'block';
    }
    
    // Сбрасываем состояние статуса
    card.classList.remove('voted', 'shot', 'removed');
    if (nameElement) {
        nameElement.classList.remove('voted', 'shot', 'removed');
        nameElement.textContent = '';
        nameElement.style.display = 'none';
    }
    if (roleIcon) {
        roleIcon.classList.remove('voted', 'shot', 'removed');
        roleIcon.style.display = 'none';
    }
    if (blackCardIcon) {
        blackCardIcon.classList.remove('voted', 'shot', 'removed');
        blackCardIcon.style.display = 'none';
    }
    
    // Сбрасываем роль в глобальном состоянии
    if (window.selectedRoles[cardId]) {
        const previousRole = window.selectedRoles[cardId];
        if (previousRole === 'sheriff') window.sheriffCount--;
        else if (previousRole === 'don') window.donCount--;
        delete window.selectedRoles[cardId];
    }
    
    // Сбрасываем цвет в глобальном состоянии
    window.selectedColors[cardId] = null;
    
    // Сбрасываем статус
    if (statusIcon) {
        statusIcon.style.display = 'none';
    }
    
    // Сбрасываем карточки мафии
    const mafiaCards = card.querySelectorAll('.mafia-card');
    mafiaCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Сбрасываем счетчик серых карточек
    window.grayCardsCount[cardId] = 0;
    const grayCounter = document.getElementById(`gray-counter-${cardId}`);
    if (grayCounter) {
        grayCounter.textContent = '0';
        grayCounter.style.display = 'none'; // ИЗМЕНЕНО: Всегда скрываем при сбросе
    }
    
    // Запускаем анимацию сброса
    card.classList.remove('animate');
    setTimeout(() => {
        card.classList.add('animate');
    }, 10);
};

// ДОБАВЛЕНО: Глобальные функции для проверок
window.canSelectColor = function(cardId, color) {
    const errorElement = document.getElementById('role-error');
    const currentRole = window.selectedRoles[cardId];
    
    if (currentRole === 'sheriff' && color === 'black') {
        if (errorElement) {
            errorElement.textContent = 'Шериф не может быть черной картой!';
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
        return false;
    }
    
    if (currentRole === 'don' && color === 'red') {
        if (errorElement) {
            errorElement.textContent = 'Дон не может быть красной картой!';
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
        return false;
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    return true;
};

window.canAssignRole = function(role, cardId) {
    const errorElement = document.getElementById('role-error');
    
    if (role === 'sheriff') {
        if (window.sheriffCount > 0 && window.selectedRoles[cardId] !== 'sheriff') {
            if (errorElement) {
                errorElement.textContent = 'Шериф уже выбран! Можно выбрать только одного шерифа.';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
            return false;
        }
    } else if (role === 'don') {
        if (window.donCount > 0 && window.selectedRoles[cardId] !== 'don') {
            if (errorElement) {
                errorElement.textContent = 'Дон уже выбран! Можно выбрать только одного дона.';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
            return false;
        }
    }
    
    const currentColor = window.selectedColors[cardId];
    if (currentColor) {
        if (role === 'sheriff' && currentColor === 'black') {
            if (errorElement) {
                errorElement.textContent = 'Шериф не может быть черной картой! Сначала измените цвет карты.';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
            return false;
        }
        if (role === 'don' && currentColor === 'red') {
            if (errorElement) {
                errorElement.textContent = 'Дон не может быть красной картой! Сначала измените цвет карты.';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
            return false;
        }
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    return true;
};

    // Добавляем обработчики для кнопок сброса отдельных плашек
    const resetCardButtons = document.querySelectorAll('.reset-card-button');

    resetCardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            resetSingleCard(cardId);
        });
    });

    // Добавляем обработчик для кнопки сброса всех плашек
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Сбрасываем все плашки по одной
            for (let i = 1; i <= 10; i++) {
                resetSingleCard(i);
            }
            
            // Скрываем сообщение об ошибке
            const errorElement = document.getElementById('role-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    }
});