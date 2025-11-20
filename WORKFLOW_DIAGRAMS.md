# GitVMD Workflow Diagrams

Visual representations of system integration flows, user journeys, and component interactions.

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         GITVMD ARCHITECTURE                        │
└────────────────────────────────────────────────────────────────────┘

                              USER BROWSER
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Landing Page    OS Selector    Test Suite
              (index.html)   (public/index)  (public/test)
                    │               │               │
                    │         ┌─────┴─────┐         │
                    │         │           │         │
                    │    index.js    boot.js       │
                    │    (global)   (BootLoader)   │
                    │         │           │         │
                    │         └─────┬─────┘         │
                    │               │               │
                    │        OS SELECTION           │
                    │               │               │
              ┌─────┴───────┬───────┼───────┬───────┴─────┐
              │             │       │       │             │
         Minimal OS    Dev-Env   SCADA   AI-Desktop    Config
         (VM-based)   (Web)     (Web)    (Web)         Testing
              │             │       │       │             │
              ├─> ❌ BROKEN │       │       │             │
              │   (No VM)   │       │       │         ✅ WORKS
              │             │       │       │
              │         ┌───┴───┬───┴───┬───┴───┐
              │         │       │       │       │
              │    Desktop  Desktop Desktop Desktop
              │    Creator Creator Creator Creator
              │         │       │       │       │
              │         └───┬───┴───┬───┴───┬───┘
              │             │       │       │
              │      ┌──────┴───────┴───────┴──────┐
              │      │                              │
              │  DESKTOP ENVIRONMENT                │
              │      │                              │
              │  ┌───┴────┬──────────┬──────────┐   │
              │  │        │          │          │   │
              │ Taskbar Workspace Statusbar Windows │
              │  │        │          │          │   │
              │  │    App Icons   Clock    Window   │
              │  │        │                  Mgmt   │
              │  │        │                          │
              │  │    ┌───┴────┐                     │
              │  │    │        │                     │
              │  │  OS Apps  Views                   │
              │  │    │        │                     │
              │  │ ┌──┴──┐  ┌──┴──┐                  │
              │  │ │     │  │     │                  │
              └──┼─┤Term │  │SCADA│                  │
                 │ │inal│  │Views│                  │
                 │ └─────┘  └─────┘                  │
                 │    │        │                     │
                 │ FileBrw ViewLoader               │
                 │    │        │                     │
                 │ ┌──┴────────┴──┐                  │
                 │ │              │                  │
                 │ │  Shared FS   │  ❌ BUG: Terminal│
                 │ │ (global)     │     has separate│
                 │ │              │     instance    │
                 │ └──────────────┘                  │
                 │                                   │
                 └───────────────────────────────────┘

KEY:
✅ Fully functional
⚠️ Partial functionality
❌ Broken/Missing
```

---

## 2. Complete Boot Sequence

```
┌────────────────────────────────────────────────────────────────────┐
│                    DETAILED BOOT SEQUENCE                          │
└────────────────────────────────────────────────────────────────────┘

TIME    EVENT                           LOCATION            STATE
────────────────────────────────────────────────────────────────────
0ms     User visits site                Browser             Loading
        │
10ms    ├─> Load index.html             Server              HTML
        │   (Landing page)
20ms    │   └─> Render hero              Browser             Ready
        │
        User clicks "Launch OS Selector"
        │
50ms    ├─> Navigate to public/index    Browser             Loading
        │
60ms    ├─> Load HTML                   Server              HTML
        │   ├─> styles/main.css          Server              CSS
        │   ├─> styles/os.css            Server              CSS
        │   └─> styles/apps.css          Server              CSS
        │
100ms   ├─> Execute <script>            Browser             JS
        │   │
        │   ├─> Load js/index.js         Server              Module
110ms   │   │   └─> Define window.bootOS Global              Ready
        │   │
        │   ├─> Load js/boot.js          Server              Module
120ms   │   │   └─> Define BootLoader    Global              Ready
        │   │
        │   └─> Load js/main.js          Server              ❌ 404
130ms   │       └─> Ignore error         Browser             Skip
        │
140ms   ├─> DOMContentLoaded            Browser             Ready
        │   └─> new BootLoader().init()  boot.js:598         Init
        │
150ms   ├─> Check URL params            boot.js:16          Check
        │   └─> No ?os= parameter        -                   Skip
        │
        ├─> Show OS Selector             Browser             Ready
        │
        User clicks "Launch" on SCADA OS
        │
200ms   ├─> onclick="bootOS('scada')"   HTML                Click
        │
210ms   ├─> window.bootOS('scada')      index.js:7          Call
        │   │
220ms   │   ├─> import('./boot.js')     Dynamic             Import
        │   │
230ms   │   └─> new BootLoader()        boot.js:6           New
        │       │
240ms   │       └─> bootOS('scada')     boot.js:24          Start
        │
250ms   │           ├─> showBootProgress boot.js:517        UI
        │           │   └─> "Booting..."  Browser            Show
        │           │
260ms   │           ├─> loadOSConfig     boot.js:50          Fetch
        │           │   │
        │           │   ├─> Detect base  boot.js:52          /gitvmd
        │           │   │   └─> basePath  =                  ""
        │           │   │
270ms   │           │   ├─> Try path 1   fetch()             404
        │           │   │   /gitvmd/views/os/scada.json
        │           │   │
280ms   │           │   ├─> Try path 2   fetch()             200 ✅
        │           │   │   ../views/os/scada.json
        │           │   │
290ms   │           │   ├─> response.ok  true                OK
        │           │   │
300ms   │           │   └─> response.json() Parse            Object
        │           │       │
        │           │       └─> Return config                Config
        │           │
310ms   │           ├─> Check base type  boot.js:35          Check
        │           │   └─> meta.base === "web"              True ✅
        │           │
320ms   │           ├─> bootWebOS(config) boot.js:81         Call
        │           │   │
330ms   │           │   ├─> createDesktop boot.js:121        Build
        │           │   │   │
        │           │   │   ├─> createTaskbar                HTML
340ms   │           │   │   │   └─> GitVMD logo, menu        DOM
        │           │   │   │
        │           │   │   ├─> createDesktopIcons           HTML
350ms   │           │   │   │   └─> 8 app icons              DOM
        │           │   │   │
        │           │   │   └─> createStatusBar              HTML
360ms   │           │   │       └─> Time, stats              DOM
        │           │   │
370ms   │           │   ├─> Mount to #os-container          DOM
        │           │   │   └─> container.appendChild        Show
        │           │   │
380ms   │           │   └─> initializeApps                  Log
        │           │       └─> Console log app names        Done
        │           │
390ms   │           └─> hideBootScreen   boot.js:530         Hide
        │               ├─> .hidden class  Boot screen        Hide
        │               └─> .hidden remove  #app              Show
        │
400ms   └─> Desktop visible              Browser             Ready

TOTAL BOOT TIME: 400ms (local) or 2s (GitHub Pages)

SUCCESS: SCADA OS running ✅
```

---

## 3. User Workflow: Open Apps and Create Files

```
┌────────────────────────────────────────────────────────────────────┐
│       USER WORKFLOW: TERMINAL + FILE BROWSER INTERACTION           │
└────────────────────────────────────────────────────────────────────┘

STEP 1: Open Terminal
──────────────────────
User clicks Terminal icon
    │
    ├─> launchApp(app)                  boot.js:215
    │   └─> app.exec = "os.terminal"
    │
    ├─> openOSApp('terminal')           boot.js:239
    │   │
    │   ├─> createWindow('Terminal')    boot.js:409
    │   │   └─> Returns window element
    │   │
    │   ├─> import('./apps/terminal.js') Dynamic
    │   │   └─> { Terminal } class
    │   │
    │   ├─> new Terminal(contentEl)     terminal.js:6
    │   │   │
    │   │   ├─> this.fileSystem = this.initFileSystem()
    │   │   │   └─> ❌ Creates NEW filesystem instance!
    │   │   │
    │   │   └─> render()                terminal.js:80
    │   │       └─> Terminal UI appears
    │   │
    │   └─> Append window to workspace
    │
    └─> Terminal window visible ✅

STEP 2: Create file in Terminal
────────────────────────────────
User types: touch myfile.txt
    │
    ├─> Enter key pressed               terminal.js:109
    │
    ├─> executeCommand('touch myfile.txt') terminal.js:134
    │   │
    │   ├─> Parse: command='touch', args=['myfile.txt']
    │   │
    │   ├─> this.commands['touch']      terminal.js:65
    │   │   └─> createFile(['myfile.txt'])
    │   │
    │   └─> createFile(args)             terminal.js:294
    │       │
    │       ├─> Get current dir          this.fileSystem
    │       │   └─> dir = /home/guest
    │       │
    │       └─> Create file in dir       this.fileSystem ❌
    │           └─> dir.contents['myfile.txt'] = {...}
    │
    └─> File created in Terminal's PRIVATE filesystem ❌

STEP 3: Open File Browser
──────────────────────────
User clicks File Browser icon
    │
    ├─> openOSApp('files')              boot.js:239
    │   │
    │   ├─> createWindow('File Browser')
    │   │
    │   ├─> import('./apps/file-browser.js')
    │   │
    │   └─> new FileBrowser(contentEl, window.globalFileSystem)
    │       │                           ^^^^^^^^^^^^^^^^^^^
    │       │                           Uses GLOBAL filesystem ✅
    │       │
    │       ├─> this.fileSystem = fileSystem (parameter)
    │       │   └─> Points to window.globalFileSystem
    │       │
    │       └─> loadDirectory('/home/guest')
    │           └─> Shows files from GLOBAL filesystem
    │
    └─> File Browser window visible ✅

STEP 4: Look for myfile.txt
────────────────────────────
User sees File Browser contents
    │
    ├─> File Browser reads: window.globalFileSystem
    │   └─> Contents: README.md, projects/ only
    │
    └─> myfile.txt NOT VISIBLE ❌

Why? TWO SEPARATE FILESYSTEMS!
───────────────────────────────

Terminal:        this.fileSystem = { NEW INSTANCE }
                      └─> myfile.txt exists here ✓

File Browser:    this.fileSystem = window.globalFileSystem
                      └─> myfile.txt NOT here ✗

Result: NO SYNCHRONIZATION ❌

EXPECTED BEHAVIOR:
──────────────────
Both apps should share window.globalFileSystem
    └─> Changes in one app visible in other app ✓

ACTUAL BEHAVIOR:
────────────────
Terminal has separate filesystem
    └─> Changes isolated, not shared ✗

FIX REQUIRED:
─────────────
// terminal.js:12
this.fileSystem = window.globalFileSystem || this.initFileSystem();
```

---

## 4. Window Z-Index Management Flow

```
┌────────────────────────────────────────────────────────────────────┐
│              WINDOW Z-INDEX MANAGEMENT WORKFLOW                    │
└────────────────────────────────────────────────────────────────────┘

INITIAL STATE: No windows open
───────────────────────────────

Workspace: Empty
Z-index: N/A


STEP 1: Open Window A (Terminal)
─────────────────────────────────

Create window
    │
    ├─> win.style.zIndex = initial (not set)
    │
    ├─> Attach mousedown listener:
    │   win.addEventListener('mousedown', () => {
    │       document.querySelectorAll('.os-window')
    │           .forEach(w => w.style.zIndex = '1000');
    │       win.style.zIndex = '1001';
    │   });
    │
    └─> Window A created

State:
    Window A: zIndex = undefined (defaults to 0)
    No other windows


STEP 2: Open Window B (File Browser)
─────────────────────────────────────

Create window (same as Step 1)

State:
    Window A: zIndex = undefined
    Window B: zIndex = undefined
    (Order: B appears on top due to DOM order)


STEP 3: User clicks Window A
─────────────────────────────

mousedown event fires on Window A
    │
    ├─> Execute listener:
    │   │
    │   ├─> Find all windows:
    │   │   querySelectorAll('.os-window')
    │   │   └─> Returns: [Window A, Window B]
    │   │
    │   ├─> Set all to background:
    │   │   forEach(w => w.style.zIndex = '1000')
    │   │   └─> Window A: 1000
    │   │       Window B: 1000
    │   │
    │   └─> Set clicked to foreground:
    │       win.style.zIndex = '1001'
    │       └─> Window A: 1001 ✅
    │
    └─> Window A now on top

State:
    Window A: zIndex = 1001 (on top) ✅
    Window B: zIndex = 1000 (behind)


STEP 4: User clicks Window B
─────────────────────────────

mousedown event fires on Window B
    │
    ├─> Execute listener:
    │   │
    │   ├─> Set all to background:
    │   │   └─> Window A: 1000
    │   │       Window B: 1000
    │   │
    │   └─> Set clicked to foreground:
    │       └─> Window B: 1001 ✅
    │
    └─> Window B now on top

State:
    Window A: zIndex = 1000 (behind)
    Window B: zIndex = 1001 (on top) ✅


STEP 5: Open Window C (Code Editor)
────────────────────────────────────

Create window (same as Step 1)

State:
    Window A: zIndex = 1000
    Window B: zIndex = 1001
    Window C: zIndex = undefined (defaults to 0, behind all)

Visual order (back to front):
    Window C (0) → Window A (1000) → Window B (1001)


STEP 6: User clicks Window C
─────────────────────────────

mousedown event fires on Window C
    │
    ├─> Set all to 1000:
    │   └─> A: 1000, B: 1000, C: 1000
    │
    └─> Set C to 1001:
        └─> Window C: 1001 ✅

Final State:
    Window A: zIndex = 1000
    Window B: zIndex = 1000
    Window C: zIndex = 1001 (on top) ✅

Visual order (back to front):
    Window A (1000) → Window B (1000) → Window C (1001)

CONCLUSION:
───────────
✅ Z-index management works correctly
✅ Clicked window always brought to front
✅ Other windows pushed to background
✅ No z-index conflicts
✅ Works with unlimited windows

EDGE CASE:
──────────
If new window created with default z-index (undefined/0):
    └─> Appears behind all existing windows
    └─> First click brings it to front ✅
```

---

## 5. SCADA View Loading Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                  SCADA VIEW LOADING WORKFLOW                       │
└────────────────────────────────────────────────────────────────────┘

STEP 1: SCADA OS Booted
────────────────────────

Desktop shows 8 app icons including:
    - Process Overview (view:scada/overview)
    - Process Details (view:scada/process-detail)
    - Alarms & Events (view:scada/alarms)
    - Trends (view:scada/trends)


STEP 2: User clicks "Process Overview"
───────────────────────────────────────

Icon click
    │
    ├─> launchApp(app)                      boot.js:215
    │   │
    │   └─> app = {
    │       name: "Process Overview",
    │       icon: "factory",
    │       exec: "view:scada/overview"
    │   }
    │
    ├─> Detect exec type                    boot.js:218
    │   └─> app.exec.startsWith('view:')    TRUE ✅
    │
    └─> Route to openView()                 boot.js:227


STEP 3: Open View
─────────────────

openView('scada/overview')                  boot.js:227
    │
    ├─> import('./view-loader.js')          Dynamic
    │   └─> { ViewLoader } class
    │
    ├─> new ViewLoader('/views')            view-loader.js:7
    │   │
    │   └─> Detect GitHub Pages base:       view-loader.js:9
    │       const ghBasePath = window.location.pathname
    │           .includes('/gitvmd/') ? '/gitvmd' : '';
    │       this.baseURL = ghBasePath + '/views';
    │
    ├─> createWindow('scada/overview')      boot.js:231
    │   └─> Returns window element
    │
    ├─> Get content element:                boot.js:232
    │   contentEl = windowEl.querySelector('.window-content')
    │
    ├─> loader.renderView()                 boot.js:234
    │   │
    │   └─> await loader.renderView('scada/overview', contentEl)
    │
    └─> Append window to workspace          boot.js:236


STEP 4: ViewLoader.renderView()
────────────────────────────────

renderView(viewName, container)             view-loader.js:29
    │
    ├─> loadView(viewName)                  view-loader.js:14
    │   │
    │   ├─> Check cache:                    view-loader.js:15
    │   │   if (this.cache.has('scada/overview'))
    │   │   └─> Return cached (if exists)
    │   │
    │   ├─> Fetch view JSON:                view-loader.js:19
    │   │   fetch('/views/scada/overview.json')
    │   │   │
    │   │   ├─> Request sent to server
    │   │   ├─> Server returns 200 OK
    │   │   └─> response.json()
    │   │       └─> Parsed view object
    │   │
    │   └─> Cache view:                     view-loader.js:25
    │       this.cache.set('scada/overview', viewData)
    │
    ├─> Create renderer:                    view-loader.js:31
    │   const renderer = new ViewRenderer()
    │
    └─> renderer.render()                   view-loader.js:32
        └─> await renderer.render(view, container)


STEP 5: ViewRenderer.render()
──────────────────────────────

render(view, container)                     view-loader.js:37
    │
    ├─> Clear container:                    view-loader.js:38
    │   container.innerHTML = ''
    │
    ├─> Render component tree:              view-loader.js:39
    │   renderComponent(view.root)
    │   │
    │   └─> view.root = {
    │       type: "container.flex",
    │       props: { ... },
    │       children: [ ... ]
    │   }
    │
    └─> renderComponent(component)          view-loader.js:43


STEP 6: Recursive Component Rendering
──────────────────────────────────────

renderComponent(component)                  view-loader.js:43
    │
    ├─> Create element:                     view-loader.js:44
    │   const element = document.createElement('div')
    │   element.className = 'component-container.flex'
    │
    ├─> Apply props:                        view-loader.js:48
    │   applyProps(element, component.props)
    │   │
    │   └─> For each prop:                  view-loader.js:62
    │       if (value.startsWith('{'))
    │       │   └─> Tag binding: bindTag()  view-loader.js:65
    │       else
    │           └─> element.dataset[key] = value
    │
    ├─> Render children:                    view-loader.js:51
    │   for (const child of component.children)
    │   │
    │   └─> Recursively call renderComponent(child)
    │       └─> Append to parent element
    │
    └─> Return element                      view-loader.js:58


STEP 7: Mount to Window
────────────────────────

container.appendChild(root)                 view-loader.js:40
    │
    └─> View tree added to window content


STEP 8: Window Visible
───────────────────────

User sees:
    ┌─────────────────────────────────────┐
    │ scada/overview                  − □ × │
    ├─────────────────────────────────────┤
    │                                     │
    │  Plant Overview - Area 1            │
    │                                     │
    │  [Empty container - children]       │
    │                                     │
    │                                     │
    └─────────────────────────────────────┘

RESULT:
    ✅ View loads successfully
    ✅ JSON structure parsed
    ✅ Component tree rendered
    ⚠️ Minimal content (as designed in JSON)
    ❌ Tag bindings stored but not active
    ❌ No real-time updates


CACHE BEHAVIOR:
───────────────

First load:    Fetches from server (~50ms)
Second load:   Returns from cache (~1ms) ✅
Cache key:     'scada/overview'
Cache store:   Map() in ViewLoader instance

If view JSON changes:
    └─> No auto-refresh (cache not invalidated)
        └─> Must reload page or clear cache manually
```

---

## 6. Error Scenario: Missing Config

```
┌────────────────────────────────────────────────────────────────────┐
│          ERROR FLOW: MISSING OS CONFIGURATION FILE                 │
└────────────────────────────────────────────────────────────────────┘

User clicks "Launch Non-Existent OS"
    │
    └─> bootOS('invalid-os')                index.js:7
        │
        └─> BootLoader.bootOS('invalid-os') boot.js:24


TRY BLOCK:
──────────

showBootProgress('invalid-os')              boot.js:29
    │
    └─> Shows: "Booting invalid-os..."

loadOSConfig('invalid-os')                  boot.js:32
    │
    ├─> Detect basePath                     boot.js:52
    │   └─> basePath = '' (local)
    │
    ├─> Build paths array:                  boot.js:55
    │   [
    │     '/views/os/invalid-os.json',
    │     '../views/os/invalid-os.json',
    │     '../../views/os/invalid-os.json',
    │     '/views/os/invalid-os.json'
    │   ]
    │
    └─> For each path:                      boot.js:65
        │
        ├─> PATH 1: /views/os/invalid-os.json
        │   │
        │   ├─> fetch(path)                 boot.js:68
        │   │   └─> Server response: 404 NOT FOUND
        │   │
        │   ├─> response.ok = false         boot.js:69
        │   │
        │   └─> Continue to next path       boot.js:73
        │
        ├─> PATH 2: ../views/os/invalid-os.json
        │   │
        │   ├─> fetch(path)
        │   │   └─> 404 NOT FOUND
        │   │
        │   └─> Continue to next path
        │
        ├─> PATH 3: ../../views/os/invalid-os.json
        │   │
        │   ├─> fetch(path)
        │   │   └─> 404 NOT FOUND
        │   │
        │   └─> Continue to next path
        │
        └─> PATH 4: /views/os/invalid-os.json
            │
            ├─> fetch(path)
            │   └─> 404 NOT FOUND (same as path 1)
            │
            └─> End of loop, all paths failed


ALL PATHS FAILED:
─────────────────

throw new Error('OS config not found: invalid-os') boot.js:78


CATCH BLOCK:
────────────

} catch (error) {                           boot.js:44
    │
    ├─> console.error('Boot failed:', error) boot.js:45
    │   └─> Console: "Boot failed: Error: OS config not found: invalid-os"
    │
    └─> showBootError(error)                boot.js:46


showBootError(error):
─────────────────────

showBootError(error)                        boot.js:538
    │
    ├─> alert(`Boot failed: ${error.message}`) boot.js:539
    │   │
    │   └─> Browser shows alert dialog:
    │       ┌──────────────────────────────────┐
    │       │  Boot failed: OS config not      │
    │       │  found: invalid-os               │
    │       │                                   │
    │       │           [ OK ]                  │
    │       └──────────────────────────────────┘
    │
    │   User clicks OK
    │
    └─> location.reload()                   boot.js:540
        │
        └─> Page reloads, back to OS selector


USER EXPERIENCE:
────────────────

1. User sees OS selector
2. Clicks boot (or malformed link)
3. Loading screen appears briefly
4. Alert pops up with error
5. User clicks OK
6. Page reloads
7. Back at OS selector (context lost) ⚠️


PROBLEMS:
─────────

❌ Alert is jarring and not user-friendly
❌ Error message could be more helpful
❌ Page reload loses user context
❌ No "try again" or "go back" option
❌ Error not logged to server/analytics


BETTER UX:
──────────

Show error in UI instead of alert:

    ┌──────────────────────────────────────┐
    │  ⚠️ Boot Failed                      │
    │                                      │
    │  Could not load configuration for    │
    │  "invalid-os"                        │
    │                                      │
    │  Possible reasons:                   │
    │  • OS does not exist                 │
    │  • Network error                     │
    │  • Invalid configuration             │
    │                                      │
    │  [ Back to OS Selector ] [ Retry ]   │
    └──────────────────────────────────────┘

No page reload, user can try again ✅
```

---

## 7. Component Integration Map

```
┌────────────────────────────────────────────────────────────────────┐
│              COMPONENT INTEGRATION & DATA FLOW                     │
└────────────────────────────────────────────────────────────────────┘

                         index.html (Landing)
                                │
                    ┌───────────┴───────────┐
                    │                       │
              Launch Button         Test Suite Button
                    │                       │
                    ↓                       ↓
            public/index.html       public/test.html
            (OS Selector)           (Test Runner)
                    │                       │
            ┌───────┴───────┐               │
            │               │               │
         index.js       boot.js             │
            │               │               │
            │       ┌───────┴───────────────┼───────┐
            │       │                       │       │
            │   BootLoader              testOS()    │
            │       │                       │       │
            └───────┼───────┬───────────────┘       │
                    │       │                       │
              bootWebOS  bootVMOS              loadOSConfig()
                    │       │                   (same logic)
                    │       │                       │
            ┌───────┴───┐   │                   ✅ TESTS
            │           │   │                   Config only
        createDesktop   │   └─> import vm-engine.js
            │           │           │
            │           │           └─> ❌ MISSING FILE
            │           │
    ┌───────┴───────┬───┴────────┬──────────┐
    │               │            │          │
Taskbar      Desktop Icons   Workspace  Statusbar
    │               │            │          │
    │           ┌───┴────────┐   │          │
    │           │            │   │          │
    │      OS Apps        Views  │          │
    │           │            │   │          │
    │   ┌───────┴───┐    ┌──┴───┴──┐       │
    │   │           │    │         │       │
    │ Terminal  FileBrowser  ViewLoader    │
    │   │           │         │            │
    │   │      ┌────┴────┐    │            │
    │   │      │         │    │            │
    │   │   Private  Global   │            │
    │   │   FileSystem FileSystem          │
    │   │      │         │    │            │
    │   │      ❌ BUG    ✅   │            │
    │   │   Separate  Shared  │            │
    │   │   instance instance  │            │
    │   │           │         │            │
    │   │           └─────┬───┘            │
    │   │                 │                │
    │   │          window.globalFileSystem │
    │   │                                  │
    │   └──────────────────┬───────────────┘
    │                      │
    │                Window Management
    │                      │
    │              ┌───────┴───────┐
    │              │               │
    │         Z-Index Mgmt    Window Ops
    │              │               │
    │          ✅ Works       ┌────┴────┐
    │                         │         │
    │                      Drag/   Minimize
    │                     Resize      │
    │                         │       │
    │                     ✅ Works  ⚠️ No
    │                            restore
    └────────────────────────────────┘

LEGEND:
═══════
─────  Data flow
┌───┐  Component
  │    Dependency
  ✅   Working
  ⚠️   Partial
  ❌   Broken

KEY INTEGRATION POINTS:
═══════════════════════

1. index.js → boot.js
   Status: ✅ Working
   Type: Dynamic import
   Data: OS type string

2. boot.js → OS configs
   Status: ✅ Working (web-based)
           ❌ Broken (VM-based)
   Type: Fetch JSON
   Data: OS configuration object

3. boot.js → Apps
   Status: ✅ Terminal/FileBrowser
           ⚠️ Others (placeholders)
   Type: Dynamic import
   Data: App initialization

4. Apps → Filesystem
   Status: ❌ Terminal separate
           ✅ FileBrowser shared
   Type: Object reference
   Data: File tree structure

5. boot.js → ViewLoader
   Status: ✅ Working
   Type: Dynamic import
   Data: View name string

6. ViewLoader → View JSON
   Status: ✅ Working
   Type: Fetch JSON + cache
   Data: Component tree

7. Windows → Z-index
   Status: ✅ Working
   Type: Event listeners
   Data: Mouse events

8. Test suite → Configs
   Status: ✅ Working
   Type: Same as boot.js
   Data: Validation checks
```

---

**End of Workflow Diagrams**

For detailed analysis, see:
- INTEGRATION_TEST_REPORT.md (full report)
- INTEGRATION_TEST_SUMMARY.md (quick overview)
