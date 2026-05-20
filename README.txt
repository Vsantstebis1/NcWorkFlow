NC WORKFLOW SYSTEM
==================

OPÇÃO A — WEBAPP (OneDrive / browser local)
--------------------------------------------
1. Coloca todos os ficheiros numa pasta (ex: OneDrive\NCWorkflow\)
2. Abre index.html no browser
3. Dados guardados em IndexedDB do browser — persistem entre sessões
4. LIMITAÇÃO: cada browser tem os seus próprios dados (não partilhados entre utilizadores)

Para partilha real entre utilizadores → usar OPÇÃO B


OPÇÃO B — EXE WINDOWS (partilhado OneDrive)
--------------------------------------------
Pré-requisitos: Node.js >= 18  (https://nodejs.org)

Build:
  1. Abre PowerShell na pasta ncworkflow\
  2. Executa: build.bat
  3. Output: dist\NCWorkflow-win32-x64\

Deploy partilhado:
  1. Copia NCWorkflow-win32-x64\ para pasta OneDrive partilhada
  2. Todos os utilizadores correm NCWorkflow.exe dessa pasta
  3. Dados guardados em NCWorkflow-win32-x64\data\ (json files)
  4. OneDrive sincroniza os ficheiros de dados automaticamente
  5. Live-sync: cada janela verifica mudanças a cada 12 segundos

Estrutura de dados:
  data\
    nc-wf-v1.json    — formas, sequências, operações, progresso
    nc_settings.json — configurações globais


TECLAS / NOTAS
--------------
- Todos os ficheiros HTML são self-contained (sem internet necessária)
- Dados guardados automaticamente após cada alteração
- Import/Export JSON mantido para backup manual
