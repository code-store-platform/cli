import { homedir } from 'os';
import { appendFile } from 'fs';
import { promisify } from 'util';


/*
 Command is used for attaching reference for autocomplete script
 Use codestore autocomplete, then this script
 */
const initializeAutocomplete = async ():Promise<void> => {
  const append = promisify(appendFile);
  try {
    await append(`${homedir()}/.bashrc`, `
  # codestore autocomplete setup
  CODESTORE_AC_BASH_SETUP_PATH=/home/dmukhopadov/.cache/codestore-cli/autocomplete/bash_setup && test -f $CODESTORE_AC_BASH_SETUP_PATH && source $CODESTORE_AC_BASH_SETUP_PATH;\
  sdz`);
  } catch (e) {
    console.log(e);
  }
};

export default initializeAutocomplete();
