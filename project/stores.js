"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("./document");
const entity_1 = require("./entity");
const enums_1 = require("./enums");
const transaction_1 = require("./transaction");
const uid20 = new entity_1.Entity("uid20");
const uid21 = new entity_1.Entity("uid21");
const uid22 = new entity_1.Entity("uid22");
const uid30 = new entity_1.Entity("uid30");
const uid31 = new entity_1.Entity("uid31");
const uid40 = new entity_1.Entity("uid40");
const uid990 = new entity_1.Entity("uid990");
const doc1 = new document_1.Document("doc1", "payload", uid20, [uid22], enums_1.Consensus.ALL);
const doc2 = new document_1.Document("doc2", "payload", uid30, [uid20], enums_1.Consensus.ALL);
const doc3 = new document_1.Document("doc3", "payload", uid40, [uid40, uid30, uid31], enums_1.Consensus.ALL);
console.log("doc3 keepers");
console.log(doc1.keepers);
console.log("doc3 updated keepers");
doc1.addKeeper(uid20);
console.log(doc1.keepers);
const documentStore = [doc1, doc2, doc3];
exports.documentStore = documentStore;
const t1 = new transaction_1.Transaction(enums_1.TransactionType.AUTH_GRANT, doc2.id, uid990);
const t2 = new transaction_1.Transaction(enums_1.TransactionType.AUTH_GRANT, doc2.id, uid990);
const t3 = new transaction_1.Transaction(enums_1.TransactionType.AUTH_GRANT, doc1.id, uid990);
const pos0 = [];
pos0.push(doc3.keepers[2]);
const pos1 = [];
pos1.push(doc3.keepers[0]);
const pos2 = [];
pos2.push(doc3.keepers[1]);
const p1 = new transaction_1.Transaction(enums_1.TransactionType.ALLOW, doc3.id, uid990);
const p2 = new transaction_1.Transaction(enums_1.TransactionType.DENY, doc3.id, uid990);
const p3 = new transaction_1.Transaction(enums_1.TransactionType.ALLOW, doc3.id, uid990);
p1.keepers = pos0;
p2.keepers = pos1;
p3.keepers = pos2;
/* console.log(t1.id)
console.log(t2.id)
console.log(t3.id)
*/
const x1 = new transaction_1.Transaction(enums_1.TransactionType.REQUEST, "doc3", uid990);
// t2.id = x1.id;
// let userTestStatus: { name: type, name: type }[] = [];
// export documentStore;
const permissionStore = [p1, p2, p3];
exports.permissionStore = permissionStore;
// export permissionStore;
const transactionStore = [t1, t2, t3];
exports.transactionStore = transactionStore;
const x1Copy = x1.clone();
/* console.log("X1 copy:");
console.log(x1Copy); */
x1Copy.applyTransaction();
/* console.log(x1);
console.log("X1 copy:");
console.log(x1Copy); */
const x2 = new transaction_1.Transaction(enums_1.TransactionType.REQUIRE, "doc3", uid990);
x2.id = x1Copy.id;
console.log("X1Copy equals X2");
console.log(x1Copy.equals(x2));
x1Copy.applyTransaction();
const x3 = new transaction_1.Transaction(enums_1.TransactionType.AUTH_GRANT, doc3.id, uid990);
x3.id = x2.id;
console.log("X1Copy equals X3");
console.log(x1Copy.equals(x3));
console.log("Es burro que doi");
console.log(x3);
/* console.log("X3");
console.log("X1Copy");
console.log(x1Copy); */
