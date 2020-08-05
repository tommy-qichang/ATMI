import React from 'react';

export default class Reg extends React.Component {
    static checkEmail = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
    static isStringEmpty(inputString) {
        if(inputString.replace(/[\ ]/g, "").replace(/\s*/g, "") === "") {
            return true;
        }
        else {
            return false;
        }
    }

}