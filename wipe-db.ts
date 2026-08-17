import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import fs from "fs";

const configRaw = fs.readFileSync("./firebase-applet-config.json", "utf8");
const firebaseConfig = JSON.parse(configRaw);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function wipeDatabase() {
    console.log("Iniciando limpeza do banco de dados...");
    
    // 1. Apagar todos os estudantes (students)
    const studentsSnap = await getDocs(collection(db, "students"));
    console.log(`Apagando \${studentsSnap.size} registros de students...`);
    for (const d of studentsSnap.docs) {
        await deleteDoc(doc(db, "students", d.id));
    }
    
    // 2. Apagar logs, routines e assessments
    const tablesToWipe = ["routines", "logs", "assessments", "faturas", "pagamentos", "academias", "personais", "assinaturas"];
    for (const table of tablesToWipe) {
        const snap = await getDocs(collection(db, table));
        if (snap.size > 0) {
            console.log(`Apagando \${snap.size} registros de \${table}...`);
            for (const d of snap.docs) {
                await deleteDoc(doc(db, table, d.id));
            }
        }
    }

    // 3. Apagar todos os usuários (users) exceto admins
    const usersSnap = await getDocs(collection(db, "users"));
    console.log(`Verificando \${usersSnap.size} registros de users...`);
    for (const d of usersSnap.docs) {
        const userData = d.data();
        if (userData.role !== 'admin') {
            await deleteDoc(doc(db, "users", d.id));
            console.log(`Usuário \${userData.email} deletado.`);
        } else {
            console.log(`Usuário Admin \${userData.email} mantido.`);
        }
    }
    
    console.log("Limpeza concluída com sucesso!");
    process.exit(0);
}

wipeDatabase().catch(console.error);
