/***********************************************************************************
                                 TRANSACTION ENUMS
 **********************************************************************************/
/**
*
*
* @enum {string}
*/
enum TransactionType {
    REGISTER = "register",
    REQUEST = "request",
    REQUIRE = "require",
    REVOKE = "revoke",
    AUTH_GRANT = "auth-grant",
    AUTH_DENY = "auth_deny",
    ALLOW = "allow",
    DENY = "deny"
}

/**
*
*
* @enum {number}
*/
enum PermissionLevel {
    NONE,
    READ,
    WRITE,
    READWRITE
}
/***********************************************************************************
                                 DOCUMENT ENUMS
 **********************************************************************************/
/**
*
*
* @enum {string}
*/
enum Consensus {
    ALL = "all",
    MAJORITY = "majority",
    ONE = "one",
    ONLY_OWNER = "only_owner"
}
/**
* 
* 
* @enum {string}
*/
enum EditionType {
    ADD_KEEPER = "add_keeper",
    REMOVE_KEEPER = "remove_keeper",
    DATA = "data",
    OWNER = "owner"
}
enum Status {
    ENABLED,
    DISABLED
}
export {TransactionType, PermissionLevel, Consensus, EditionType, Status};
