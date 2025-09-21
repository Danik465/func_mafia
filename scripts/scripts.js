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

document.addEventListener('DOMContentLoaded', function() {
    // Объект для хранения выбранных ролей для каждой плашки
    const selectedRoles = {};
    // Объект для хранения выбранных цветов для каждой плашки
    const selectedColors = {};
    // Объект для хранения элементов с именами игроков
    const nameElements = {};
    
    // Переменные для отслеживания количества выбранных ролей
    let sheriffCount = 0;
    let donCount = 0;

    // Флаг для отслеживания выбора цвета для каждой плашки
    const hasColorSelected = {};

    // Объект для хранения выбранных карточек мафии для каждой плашки
    const selectedMafiaCards = {};

    // Функция для инициализации плашек
    function initializeCards() {
        for (let i = 1; i <= 10; i++) {
            const card = document.getElementById(`card-${i}`);
            const cardText = card.querySelector('.card-text');
            const defaultImage = card.querySelector('.default-image');
            const blackCardIcon = document.getElementById(`black-card-icon-${i}`);

            // Устанавливаем номер плашки
            const cardNumber = card.querySelector('.card-number');
            cardNumber.textContent = i;
            

            
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
                gray: false,
                yellow: false
            };
            
            // Создаем элемент для отображения имени
            const nameElement = document.createElement('div');
            nameElement.className = 'player-name';
            card.parentNode.appendChild(nameElement);
            nameElements[i] = nameElement;
            
            // Создаем контейнер для карточек мафии
            const mafiaContainer = document.createElement('div');
            mafiaContainer.className = 'mafia-cards-container';
            mafiaContainer.id = `mafia-container-${i}`;
            card.appendChild(mafiaContainer);
            
            // Создаем три карточки разных цветов (изображения)
            for (const cardType of ['red', 'gray', 'yellow']) {
                const cardElement = document.createElement('img');
                cardElement.className = 'mafia-card';
                cardElement.id = `mafia-card-${cardType}-${i}`;
                cardElement.src = mafiaCardImages[cardType];
                cardElement.alt = `${cardType} card`;
                cardElement.style.display = 'none'; // ИЗМЕНЕНО: Явно скрываем карточки
                mafiaContainer.appendChild(cardElement);
            }
            
            // Запускаем анимацию появления плашки
            setTimeout(() => {
                card.classList.add('animate');
            }, i * 100);
        }
    }

    // Функция для анимации плашки
    function animateCard(cardId) {
        const card = document.getElementById(`card-${cardId}`);
        card.classList.remove('animate');
        setTimeout(() => {
            card.classList.add('animate');
        }, 10);
    }

    // Функция для анимации иконки черной карты
    function animateBlackCardIcon(cardId) {
        const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);
        blackCardIcon.classList.remove('animate');
        setTimeout(() => {
            blackCardIcon.classList.add('animate');
        }, 10);
    }

    // Функция для проверки, можно ли назначить роль
    function canAssignRole(role, cardId) {
        const errorElement = document.getElementById('role-error');
        
        // Проверяем, не назначена ли уже эта роль другой плашке
        if (role === 'sheriff') {
            if (sheriffCount > 0 && selectedRoles[cardId] !== 'sheriff') {
                errorElement.textContent = 'Шериф уже выбран! Можно выбрать только одного шерифа.';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
                return false;
            }
        } else if (role === 'don') {
            if (donCount > 0 && selectedRoles[cardId] !== 'don') {
                errorElement.textContent = 'Дон уже выбран! Можно выбрать только одного дона.';
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
                return false;
            }
        }
        
        errorElement.style.display = 'none';
        return true;
    }

    // Функция для обновления счетчиков ролей
    function updateRoleCounters() {
        sheriffCount = 0;
        donCount = 0;
        
        for (const cardId in selectedRoles) {
            if (selectedRoles[cardId] === 'sheriff') {
                sheriffCount++;
            } else if (selectedRoles[cardId] === 'don') {
                donCount++;
            }
        }
    }

    // Функция для отображения роли на плашке
    function showRoleIcon(cardId, role) {
        const roleIcon = document.getElementById(`role-icon-${cardId}`);
        
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
            blackCardIcon.style.display = 'none';
        }
    }

    // Функция для сброса отдельной плашки
    function resetSingleCard(cardId) {
        const card = document.getElementById(`card-${cardId}`);
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
        cardNumber.textContent = cardId;

        // Восстанавливаем изображение по умолчанию
        defaultImage.src = `${DEFAULT_IMAGE_PATH}.png`;
        defaultImage.style.display = 'block';
        hasColorSelected[cardId] = false;

        // Сбрасываем состояние статуса
        card.classList.remove('voted', 'shot', 'removed');
        nameElement.classList.remove('voted', 'shot', 'removed');
        roleIcon.classList.remove('voted', 'shot', 'removed');
        blackCardIcon.classList.remove('voted', 'shot', 'removed');

        // Сбрасываем имя
        if (nameInput) {
            nameInput.value = '';
        }
        nameElement.textContent = '';
        nameElement.style.display = 'none';
        
        // Сбрасываем роль
        if (selectedRoles[cardId]) {
            const previousRole = selectedRoles[cardId];
            if (previousRole === 'sheriff') {
                sheriffCount--;
            } else if (previousRole === 'don') {
                donCount--;
            }
            delete selectedRoles[cardId];
        }
        roleIcon.style.display = 'none';
        roleIcon.classList.remove('animate', 'voted', 'shot', 'removed');
        
        // Сбрасываем статус
        statusIcon.style.display = 'none';
        
        // Сбрасываем карточки мафии
        const mafiaCards = card.querySelectorAll('.mafia-card');
        mafiaCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Сбрасываем состояние карточек мафии
        selectedMafiaCards[cardId] = {
            red: false,
            gray: false,
            yellow: false
        };
        
        // Сбрасываем иконку черной карты
        blackCardIcon.style.display = 'none';
        blackCardIcon.classList.remove('animate', 'voted', 'shot', 'removed');
        
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
        let previousValue = ''; // Добавляем переменную для хранения предыдущего значения
        
        input.addEventListener('input', function() {
            const cardId = this.getAttribute('data-card');
            const enteredName = this.value;
            const nameElement = nameElements[cardId];
            
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
            // (когда имя становится пустым/непустым)
            if ((previousValue === '' && enteredName !== '') || 
                (previousValue !== '' && enteredName === '')) {
                animateCard(cardId);
            }
            
            previousValue = enteredName; // Обновляем предыдущее значение
        });
    });

    // Функция для установки цвета плашки
    function setCardColor(cardId, color) {
        const card = document.getElementById(`card-${cardId}`);
        const defaultImage = card.querySelector('.default-image');
        const blackCardIcon = document.getElementById(`black-card-icon-${cardId}`);

        // Устанавливаем соответствующее изображение в зависимости от цвета
        if (color === 'red') {
            defaultImage.src = mafiaCardImages.redCard;
            // Скрываем иконку черной карты
            blackCardIcon.style.display = 'none';
        } else if (color === 'black') {
            defaultImage.src = mafiaCardImages.blackCard;
            // Показываем иконку черной карты только если роль не Дон
            if (selectedRoles[cardId] !== 'don') {
                blackCardIcon.style.display = 'block';
                // Запускаем анимацию иконки
                animateBlackCardIcon(cardId);
            }
        }

        defaultImage.style.display = 'block';
        hasColorSelected[cardId] = true;
        selectedColors[cardId] = color;
        
        // Если для этой плашки есть выбранная роль, показываем ее
        if (selectedRoles[cardId]) {
            showRoleIcon(cardId, selectedRoles[cardId]);
        }

        // Запускаем анимацию для всей плашки
        animateCard(cardId);
        
        // Анимируем имя игрока, если оно есть
        const nameElement = nameElements[cardId];
        if (nameElement.textContent) {
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
            
            // Проверяем, можно ли назначить эту роль
            if (!canAssignRole(role, cardId)) {
                return;
            }
            
            // Убираем выделение с всех кнопок ролей для этой плашки
            const allRoleButtonsForCard = document.querySelectorAll(`.role-button[data-card="${cardId}"]`);
            allRoleButtonsForCard.forEach(btn => btn.classList.remove('selected'));
            
            // Добавляем выделение на clicked кнопку
            this.classList.add('selected');
            
            // Убираем предыдущую роль, если она была назначена этой плашке
            if (selectedRoles[cardId]) {
                const previousRole = selectedRoles[cardId];
                if (previousRole === 'sheriff') {
                    sheriffCount--;
                } else if (previousRole === 'don') {
                    donCount--;
                }
            }
            
            // Сохраняем выбранную роль
            selectedRoles[cardId] = role;
            
            // Обновляем счетчики ролей
            updateRoleCounters();
            
            // Если выбрана роль Дон, скрываем иконку черной карты
            if (role === 'don') {
                blackCardIcon.style.display = 'none';
            } else if (hasColorSelected[cardId] && selectedColors[cardId] === 'black') {
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


   // Добавляем обработчики для кнопок статусов (заголосован/отстрел/удален)
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
        
        // Сохраняем текущее состояние видимости иконки черной карты
        const wasBlackCardIconVisible = blackCardIcon.style.display === 'block';
        
        // Убираем выделение с всех кнопок статусов для этой плашки
        const allStatusButtonsForCard = document.querySelectorAll(`.status-button[data-card="${cardId}"]`);
        allStatusButtonsForCard.forEach(btn => btn.classList.remove('selected'));
        
        // Добавляем выделение на clicked кнопку
        this.classList.add('selected');
        
        // Устанавливаем правильный src для иконки статуса
        statusIcon.src = statusIcons[status];
        
        // Устанавливаем статус плашки
        if (status === 'voted') {
            card.classList.remove('shot', 'removed');
            card.classList.add('voted');
            // Добавляем класс для имени
            nameElement.classList.remove('shot', 'removed');
            nameElement.classList.add('voted');
            // Добавляем класс для иконки роли
            if (roleIcon.style.display === 'block') {
                roleIcon.classList.remove('shot', 'removed');
                roleIcon.classList.add('voted');
            }
        } else if (status === 'shot') {
            card.classList.remove('voted','removed');
            card.classList.add('shot');
             // Добавляем класс для имени
            nameElement.classList.remove('voted', 'removed');
            nameElement.classList.add('shot');
            // Добавляем класс для иконки роли
            if (roleIcon.style.display === 'block') {
                roleIcon.classList.remove('voted', 'removed');
                roleIcon.classList.add('shot');
            }
        } else if (status === 'removed') {
            card.classList.remove('voted', 'shot');
            card.classList.add('removed');
            
            // Добавляем класс для имени
            nameElement.classList.remove('voted', 'shot');
            nameElement.classList.add('removed');
            // Добавляем класс для иконки роли
            if (roleIcon.style.display === 'block') {
                roleIcon.classList.remove('voted', 'shot');
                roleIcon.classList.add('removed');
            }
        }
        
        // ВОССТАНАВЛИВАЕМ видимость иконки черной карты, если она была видимой
        if (wasBlackCardIconVisible) {
            blackCardIcon.style.display = 'block';
            
            // Также применяем соответствующий класс статуса к иконке черной карты
            blackCardIcon.classList.remove('voted', 'shot', 'removed');
            blackCardIcon.classList.add(status);
        }
                    
        // Показываем значок статуса
        statusIcon.style.display = 'block';
        
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
            const mafiaCard = document.getElementById(`mafia-card-${cardType}-${cardId}`);

            if (!mafiaCard) {
                console.error(`Карточка мафии не найдена: mafia-card-${cardType}-${cardId}`);
                return;
            }
            
            // Переключаем состояние карточки
            selectedMafiaCards[cardId][cardType] = !selectedMafiaCards[cardId][cardType];
            
            // Переключаем отображение карточки
            if (selectedMafiaCards[cardId][cardType]) {
                mafiaCard.style.display = 'block';
                this.classList.add('selected');
            } else {
                mafiaCard.style.display = 'none';
                this.classList.remove('selected');
            }

             // ИЗМЕНЕНО: Добавляем анимацию при переключении
            mafiaCard.classList.remove('animate');
            setTimeout(() => {
                mafiaCard.classList.add('animate');
            }, 10);


        });
    });

    // Добавляем обработчики для кнопок сброса отдельных плашек
    const resetCardButtons = document.querySelectorAll('.reset-card-button');

    resetCardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            resetSingleCard(cardId);
        });
    });

    // Добавляем обработчик для кнопки сброса всех плашек
    document.getElementById('reset-button').addEventListener('click', function() {
        // Сбрасываем все плашки по одной
        for (let i = 1; i <= 10; i++) {
            resetSingleCard(i);
        }
        
        // Скрываем сообщение об ошибке
        document.getElementById('role-error').style.display = 'none';
    });
});