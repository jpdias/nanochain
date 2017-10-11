"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***********************************************************************************
import { Transaction } from './transaction';
                                 TRANSACTION ENUMS
 **********************************************************************************/
/**
*
*
* @enum {string}
*/
var TransactionType;
(function (TransactionType) {
    TransactionType["REGISTER"] = "register";
    TransactionType["REQUEST"] = "request";
    TransactionType["REQUIRE"] = "require";
    TransactionType["REVOKE"] = "revoke";
    TransactionType["AUTH_GRANT"] = "auth-grant";
    TransactionType["AUTH_DENY"] = "auth_deny";
    TransactionType["ALLOW"] = "allow";
    TransactionType["DENY"] = "deny";
})(TransactionType || (TransactionType = {}));
exports.TransactionType = TransactionType;
/**
*
*
* @enum {number}
*/
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel[PermissionLevel["NONE"] = 0] = "NONE";
    PermissionLevel[PermissionLevel["READ"] = 1] = "READ";
    PermissionLevel[PermissionLevel["WRITE"] = 2] = "WRITE";
    PermissionLevel[PermissionLevel["READWRITE"] = 3] = "READWRITE";
})(PermissionLevel || (PermissionLevel = {}));
exports.PermissionLevel = PermissionLevel;
/***********************************************************************************
                                 DOCUMENT ENUMS
 **********************************************************************************/
/**
*
*
* @enum {string}
*/
var Consensus;
(function (Consensus) {
    Consensus["ALL"] = "all";
    Consensus["MAJORITY"] = "majority";
    Consensus["ONE"] = "one";
    Consensus["ONLY_OWNER"] = "only_owner";
})(Consensus || (Consensus = {}));
exports.Consensus = Consensus;
/**
*
*
* @enum {string}
*/
var EditionType;
(function (EditionType) {
    EditionType["ADD_KEEPER"] = "add_keeper";
    EditionType["REMOVE_KEEPER"] = "remove_keeper";
    EditionType["DATA"] = "data";
    EditionType["OWNER"] = "owner";
})(EditionType || (EditionType = {}));
exports.EditionType = EditionType;
