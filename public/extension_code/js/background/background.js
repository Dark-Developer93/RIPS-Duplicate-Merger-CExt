//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// ==============================================================================
//                         GLOBAL VARS & PORT HOLDERS
// ==============================================================================
let CSPort = null; // content script port
let RAPort = null; // react app port
let importInProgress = false; // data collect 'in progress' flag

const PORTNAME_HOLDER = [ // container for portnames
    PORTNAME_REACT_APP,
    PORTNAME_CS_ADVANCED_SEARCH,
    PORTNAME_CS_CLIENT_BASIC_INFORMATION,
    PORTNAME_CS_HISTORY,
    PORTNAME_CS_REDIRECT
];


// ==============================================================================
//                          MESSAGE POSTING FUNCTIONS
// ==============================================================================
// TODO: wrap post sending functions with port-not-found error messages
const sendPortInit = (port, code, autoStartFlag=false) => {
    // port should always exist, so don't handle other case
    port.postMessage({
        code: code,
        autoStart: autoStartFlag // if in progress, import should auto start
    });
}

const sendStartImport = (port) => {
    // TODO: handle invalid / unknown port
    port.postMessage({
        code: BKG_CS_START_IMPORT
    });
}

const sendImportErrorToReactApp = (port, message) => {
    // TODO: handle invalid / unknown port
    port.postMessage({
        code: BKG_RA_STOP_IMPORT_WITH_ERROR,
        message: message
    });
}

// ==============================================================================
//                           PORT MESSAGE LISTENERS
// ==============================================================================
const initContentScriptPort = (port) => {
    // If content script port already has been initialized, skip setting new listener
    if (CSPort) {
        console.warn('Tried initializing CSPort, even though already exists. Skipping');
        return;
    }

    // send init message to either port
    sendPortInit(port, BKG_CS_INIT_PORT, importInProgress);

    // set global content script port holder
    CSPort = port;

    port.onMessage.addListener(function(msg, MessageSender) {
        console.log('<background.js> content script port msg received', msg);

        switch(msg.code) {
            case CS_BKG_STOP_IMPORT:
                importInProgress = false;
                sendImportErrorToReactApp(RAPort, msg.message);
                break;

            case CS_BKG_START_PAGE_REDIRECT:
                const msgTabId = MessageSender.sender.tab.id;
                const url = 'http://rips.247lib.com/Stars/' + msg.urlPart
                chrome.tabs.update(msgTabId, { url: url });
                break;

            case CS_BKG_IMPORT_DONE:
                importInProgress = false;
                // sendImportDone(RAPort);
                break;

            case CS_BKG_USER_DATA_PAYLOAD:
                // sendUserDataToReact(RAPort, msg.data);
                break;

            case CS_BKG_NEXT_URL_REDIRECT:
                // const msgTabId = MessageSender.sender.tab.id;

                // chrome.tabs.update(msgTabId, { url: msg.url });
                break;

            case CS_BKG_ERROR_CODE_NOT_RECOGNIZED:
                // console.error(`${msg.source} - ${msg.data}`);
                // importInProgress = false;
                break;

            case CS_BKG_ERROR_HOW_TO_CONTINUE:
                // console.error(`Too many '>' elems found on rips page!`);
                // importInProgress = false;
                break;
            
            default: // code not recognized - send error back
                importInProgress = false;
                Utils_SendPortCodeError(port, msg.code, PORTNAME_REACT_APP);
        }
    });

    port.onDisconnect.addListener(removedPort => {
        console.log(`Port <${removedPort.name}> disconnected`);
        CSPort = null;
    });
}

const initReactAppPort = (port) => {
    // If react app port already has been initialized, skip setting new listener
    if (RAPort) {
        console.warn('Tried initializing RAPort, even though already exists. Skipping');
        return;
    }

    // send init message to either port
    sendPortInit(port, BKG_RA_INIT_PORT);

    // set global react app port holder
    RAPort = port;

    port.onMessage.addListener(function(msg) {
        console.log('<background.js> react app port msg received', msg);

        switch(msg.code) {
            case RA_BKG_START_IMPORT:
                importInProgress = true;
                sendStartImport(CSPort);
                break;

            case RA_BKG_CONTINUE_IMPORT:
                // sendContinueImport(CSPort);
                break;

            case RA_BKG_ERROR_BKG_CODE_NOT_RECOGNIZED:
                importInProgress = false;
                // console.error(`Code sent to React <${msg.errCode}> not recognized`);
                break;

            default: // code not recognized - send error back
                importInProgress = false;
                Utils_SendPortCodeError(port, msg.code, PORTNAME_REACT_APP);
        }
    });

    port.onDisconnect.addListener(removedPort => {
        console.log(`Port <${removedPort.name}> disconnected`);
        RAPort = null;

        importInProgress = false;
    });
}

// ==============================================================================
//                          PORT CONNECTION LISTENER
// ==============================================================================
chrome.runtime.onConnect.addListener(port => {
    console.assert( PORTNAME_HOLDER.includes(port.name) );
    console.log(`Port <${port.name}> connected!`);
    
    switch (port.name) {
        case PORTNAME_CS_ADVANCED_SEARCH:
        case PORTNAME_CS_CLIENT_BASIC_INFORMATION:
        case PORTNAME_CS_HISTORY:
        case PORTNAME_CS_REDIRECT:
            // init content script port listener
            initContentScriptPort( port );
            break;

        case PORTNAME_REACT_APP:
            // init react app port listener
            initReactAppPort( port );
            break;
        
        default:
            importInProgress = false;
            console.error(
                "ERR: somehow connecting port isn't recognized, but we said assert!",
                port
            );
    }
});