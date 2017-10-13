import { Document } from "./document";
import { Entity } from "./entity";
import { Consensus, EditionType, PermissionLevel, TransactionType} from "./enums";
import { Transaction } from "./transaction";

const uid20 = new Entity("uid20");
const uid21 = new Entity("uid21");
const uid22 = new Entity("uid22");
const uid30 = new Entity("uid30");
const uid31 = new Entity("uid31");
const uid40 = new Entity("uid40");
const uid990 = new Entity("uid990");
const doc1 = new Document("doc1", "payload", uid20, [uid22], Consensus.ALL);
const doc2 = new Document("doc2", "payload", uid30, [uid20], Consensus.ALL);
const doc3 = new Document("doc3", "payload", uid40, [uid40, uid30, uid31], Consensus.ALL);
const documentStore: Document[] = [doc1, doc2, doc3]; 
const t1 = new Transaction(
    TransactionType.AUTH_GRANT,
    doc2.id,
    uid990,
);
const t2 = new Transaction(
    TransactionType.AUTH_GRANT,
    doc2.id,
    uid990
);
const t3 = new Transaction(
    TransactionType.AUTH_GRANT,
    doc1.id,
    uid990
);
const pos0: Entity[] = [];
pos0.push(doc3.keepers[2]);
const pos1: Entity[] = [];
pos1.push(doc3.keepers[0]);
const pos2: Entity[] = [];
pos2.push(doc3.keepers[1]);
const p1 = new Transaction(TransactionType.ALLOW, doc3.id, uid990);
const p2 = new Transaction(TransactionType.DENY, doc3.id, uid990);
const p3 = new Transaction(TransactionType.ALLOW, doc3.id, uid990);
p1.keepers = pos0;
p2.keepers = pos1;
p3.keepers = pos2;

/* console.log(t1.id)
console.log(t2.id)
console.log(t3.id)
*/
const x1 = new Transaction(TransactionType.REQUEST, "doc3", uid990);
// t2.id = x1.id;
// let userTestStatus: { name: type, name: type }[] = [];
// export documentStore;
const permissionStore: Transaction[] = [p1, p2, p3];
// export permissionStore;
const transactionStore: Transaction[] = [t1, t2, t3];
// export transactionStore;
export {documentStore, permissionStore, transactionStore};

const x1Copy = x1.clone();
/* console.log("X1 copy:");
console.log(x1Copy); */
x1Copy.applyTransaction();
/* console.log(x1);
console.log("X1 copy:");
console.log(x1Copy); */
const x2 = new Transaction(
    TransactionType.REQUIRE,
    "doc3",
    uid990
);
x2.id = x1Copy.id;
console.log("X1Copy equals X2");
console.log(x1Copy.equals(x2));
x1Copy.applyTransaction();

const x3 = new Transaction(
    TransactionType.AUTH_GRANT,
    doc3.id,
    uid990
);

x3.id = x2.id;

console.log("X1Copy equals X3");
console.log(x1Copy.equals(x3));
console.log("Es burro que doi")
console.log(x3)
/* console.log("X3");
console.log("X1Copy");
console.log(x1Copy); */
