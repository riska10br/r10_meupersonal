import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";

const configRaw = fs.readFileSync("./firebase-applet-config.json", "utf8");
const firebaseConfig = JSON.parse(configRaw);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

const demos = [
    { email: 'gestor@gympro.com', pass: '123456', role: 'adm_academia', name: 'Gestor Demo' },
    { email: 'personal@gympro.com', pass: '123456', role: 'personal', name: 'Personal Demo' },
    { email: 'alunodemo@gympro.com', pass: '123456', role: 'aluno', name: 'Aluno Demo' }
];

async function seed() {
    console.log("Iniciando criação de acessos demo...");

    for (const demo of demos) {
        let uid;
        try {
            console.log(`Tentando criar ${demo.email}...`);
            const res = await createUserWithEmailAndPassword(auth, demo.email, demo.pass);
            uid = res.user.uid;
            console.log(`Criado com sucesso ${demo.email}`);
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                console.log(`${demo.email} já existe. Tentando login...`);
                const res = await signInWithEmailAndPassword(auth, demo.email, demo.pass);
                uid = res.user.uid;
            } else {
                console.error(`Erro ao criar ${demo.email}:`, e);
                continue;
            }
        }
        
        if (uid) {
            await setDoc(doc(db, "users", uid), {
                role: demo.role,
                name: demo.name,
                email: demo.email,
                senhaAcesso: demo.pass,
                createdAt: new Date()
            });
            console.log(`Firestore atualizado para ${demo.email}`);
        }
    }
    
    console.log("Processo concluído!");
    process.exit(0);
}

seed().catch(console.error);
