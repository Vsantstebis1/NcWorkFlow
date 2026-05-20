const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

const PROTOCOL_PREFIX = 'ncworkflow';

// Diretório padrão inicial (caso abra direto pelo executável central)
// process.cwd() obriga o Electron a usar a pasta de onde o atalho foi chamado pelo Windows
const dataDir = path.join(process.cwd(), 'data');

// Regista o protocolo especial no sistema operativo
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_PREFIX, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_PREFIX);
}

// Garante instância única para capturar cliques do browser com o app já aberto
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    const urlArg = commandLine.find(arg => arg.startsWith(`${PROTOCOL_PREFIX}://`));
    if (urlArg) processProtocolUrl(urlArg);
  });
}

// Função mágica: extrai o caminho do link do browser e isola a base de dados
function processProtocolUrl(url) {
  try {
    let rawPath = url.replace(`${PROTOCOL_PREFIX}://`, '');
    let targetPath = decodeURIComponent(rawPath);

    if (fs.existsSync(targetPath)) {
      // Define a pasta data exatamente dentro da pasta do cliente no OneDrive
      dataDir = path.join(targetPath, 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

      // Recarrega a janela ativa para ler os novos ficheiros do cliente
      const wins = BrowserWindow.getAllWindows();
      if (wins.length > 0) wins[0].loadFile('index.html');
    }
  } catch (e) {
    console.error("Erro ao processar protocolo:", e);
  }
}

ipcMain.handle('nc-get', (_, key) => {
  try {
    const f = path.join(dataDir, key + '.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  } catch { return null; }
});

ipcMain.handle('nc-set', (_, key, val) => {
  try { fs.writeFileSync(path.join(dataDir, key + '.json'), JSON.stringify(val)); } catch {}
});

// Permite abrir links do sharepoint no navegador nativo sem forçar download
ipcMain.handle('open-external-url', (_, targetUrl) => {
  try { shell.openExternal(targetUrl); return true; } catch { return false; }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 1024, minHeight: 600,
    title: 'NC Workflow System',
    backgroundColor: '#0e141a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Captura se a aplicação foi iniciada fechada a partir de um link do browser
  const urlArg = process.argv.find(arg => arg.startsWith(`${PROTOCOL_PREFIX}://`));
  if (urlArg) processProtocolUrl(urlArg);

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());