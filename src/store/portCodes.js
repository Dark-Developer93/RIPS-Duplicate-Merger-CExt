// ==============================================================================
//                           CODES FOR REACT APP FILES
// ==============================================================================

// ---------------------- INTERNAL CODES -----------------------
// constant to hold the name of the react app / background.js port
export const PORTNAME_REACT_APP = 'PORT_REACT_APP';
// comes with payload errCode (code that errored in actions/port.js)
export const ERROR_BKG_CODE_NOT_RECOGNIZED = 'ERROR_BKG_CODE_NOT_RECOGNIZED';

// ---------------------- EXTERNAL CODES -----------------------
// receive codes -> background (BKG) to react app (RA)
export const BKG_RA_INIT_PORT = 'BKG_RA_INIT_PORT';
export const BKG_RA_ERROR_CODE_NOT_RECOGNIZED = 'BKG_RA_ERROR_CODE_NOT_RECOGNIZED';
export const BKG_RA_IMPORT_DONE = 'BKG_RA_IMPORT_DONE';
export const BKG_RA_STOP_IMPORT_WITH_ERROR = 'BKG_RA_STOP_IMPORT_WITH_ERROR';
// export const BKG_RA_USER_DATA_PAYLOAD = 'BKG_RA_USER_DATA_PAYLOAD';

// send codes -> react app (RA) to background (BKG)
export const RA_BKG_START_IMPORT = 'RA_BKG_START_IMPORT';
export const RA_BKG_CONTINUE_IMPORT = 'RA_BKG_CONTINUE_IMPORT';
export const RA_BKG_STOP_IMPORT = 'RA_BKG_STOP_IMPORT';

