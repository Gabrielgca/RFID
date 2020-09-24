import React from 'react';
import firebase from './firebase';

class Utils {
    checkCategory(category) {
        let encontrou = 0;
        category.map((permission) => {
            if (permission.status === true) {
                encontrou = 1;
            }
        });

        if (encontrou === 0) {
            return false;
        }
        else {
            return true;
        }
    }

    async getOffice(cargo, callback) {
        let list;
        await firebase.getAllOffices((allOffices) => {
            allOffices.forEach((office) => {
                if (office.val().nomeCargo === cargo) {
                    list = {
                        key: office.key,
                        nomeCargo: office.val().nomeCargo,
                        permissoes: office.val().permissoes,
                        status: office.val().status
                    }
                    /* alert(JSON.stringify(list)); */
                }
            })
        });
        return list;
    }
}


export default new Utils();