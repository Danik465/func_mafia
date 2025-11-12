// ДОБАВЬТЕ этот код в начало server.js, перед созданием express приложения
const { exec } = require('child_process');

function killPort(port) {
  const platform = process.platform;
  let command = '';
  
  if (platform === 'win32') {
    command = `netstat -ano | findstr :${port} | findstr LISTENING`;
    exec(command, (err, stdout) => {
      if (stdout) {
        const pid = stdout.split('\n')[0].split(/\s+/).pop();
        exec(`taskkill /F /PID ${pid}`, (err) => {
          if (!err) {
            console.log(`✅ Освобожден порт ${port} (PID: ${pid})`);
          }
        });
      }
    });
  } else {
    command = `lsof -i :${port} | grep LISTEN | awk '{print $2}'`;
    exec(command, (err, stdout) => {
      if (stdout) {
        const pid = stdout.trim();
        exec(`kill -9 ${pid}`, (err) => {
          if (!err) {
            console.log(`✅ Освобожден порт ${port} (PID: ${pid})`);
          }
        });
      }
    });
  }
}

// Освобождаем порт перед запуском сервера
killPort(8000);

const express = require("express");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const PORT = 8000;
const AUTH_TOKEN = "123"; // Пароль для управления

// В server.js заменить существующие маршруты на:

// Раздаем статические файлы из соответствующих папок
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use(express.static(path.join(__dirname))); // Для корневых файлов

// Явно указываем маршруты для HTML файлов из корневой директории
app.get("/control.html", (req, res) => {
  res.sendFile(path.join(__dirname, "control.html"));
});

app.get("/overlay.html", (req, res) => {
  res.sendFile(path.join(__dirname, "overlay.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "control.html"));
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Сервер плашек запущен: http://localhost:${PORT}`);
  console.log(`✅ Панель управления: http://localhost:${PORT}/control.html`);
  console.log(`✅ Оверлей: http://localhost:${PORT}/overlay.html`);
});

const wss = new WebSocketServer({ server });


// Пересылаем сообщение всем клиентам (оверлеям)
wss.clients.forEach((client) => {
  if (client !== ws && client.readyState === 1) {  // ← ПРОБЛЕМА: исключает отправителя
    client.send(JSON.stringify(data));
  }
});


// Храним состояние всех плашек
const platesState = {};
for (let i = 1; i <= 10; i++) {
  platesState[i] = {
    name: "",
    color: "default",
    role: null,
    status: null,
    mafiaCards: { red: false, gray: false, yellow: false }
  };
}

wss.on("connection", (ws) => {
  ws.isAuthorized = false;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    // Авторизация
    if (data.type === "auth") {
      if (data.token === AUTH_TOKEN) {
        ws.isAuthorized = true;
        ws.send(JSON.stringify({ type: "auth_ok" }));
        console.log("✅ Подключен авторизованный клиент управления");
        
        // Отправляем текущее состояние новому клиенту
        ws.send(JSON.stringify({ 
          type: "initial_state", 
          state: platesState 
        }));
      } else {
        ws.send(JSON.stringify({ type: "auth_fail" }));
        ws.close();
      }
      return;
    }

    // Только авторизованные могут управлять
    if (!ws.isAuthorized) return;

    // Обработка команд управления
    switch (data.type) {
      case "set_name":
        platesState[data.cardId].name = data.name;
        break;
        
      case "set_color":
        platesState[data.cardId].color = data.color;
        break;
        
      case "set_role":
        platesState[data.cardId].role = data.role;
        break;
        
      case "set_status":
        platesState[data.cardId].status = data.status;
        break;
        
      case "set_mafia_card":
        platesState[data.cardId].mafiaCards[data.cardType] = data.visible;
        break;
        
      case "reset_card":
        resetSingleCard(data.cardId);
        break;
        
      case "reset_all":
        for (let i = 1; i <= 10; i++) {
          resetSingleCard(i);
        }
        break;
    }

    // Пересылаем сообщение всем клиентам (оверлеям)
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });

    console.log(`📢 Команда: ${data.type} для карточки ${data.cardId || 'all'}`);
  });

  // При подключении оверлея отправляем текущее состояние
  if (!ws.isAuthorized) {
    ws.send(JSON.stringify({ 
      type: "initial_state", 
      state: platesState 
    }));
  }
});

function resetSingleCard(cardId) {
  platesState[cardId] = {
    name: "",
    color: "default",
    role: null,
    status: null,
    mafiaCards: { red: false, gray: false, yellow: false }
  };
}

