import * as admin from "firebase-admin";

// Vérifier que Firebase est correctement initialisé
let firebaseInitialized = false;

try {
  const serviceAccount = {
    projectId: "airlock-da2c9",
    clientEmail: "firebase-adminsdk-fbsvc@airlock-da2c9.iam.gserviceaccount.com",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSGKY+ldOhKAX5\ntp5qXBdBQiLGBa1Pvt0uXvZkpxpqR9sqjntGj0icXgvolX1ouoovBUxir0x9LvKS\nZkVMCrx9fhGFmJ8h3S+t+Hm2KB4BlVD6QvP/Kep1KG/3WA/AybYhpnOrnhC8LDq5\nDTa2mZyyc0Hrt0Jx+ON/3VH+++jkq8GLfo91NomwE72VWS+GX0Q/gFEKtdbM+5jO\ntOqOq+WhAOotBaPEv0PwOPljD2ppo9DsFKCnWUN03CgIoHSnoEIzv+X6UGi+eTu/\njRDsVjyFMWuP3VE/DzaUXRSWvZHxphhR5ppnYQoqNu63epPo58kz50olBvYN9TSw\nrPcDKwyHAgMBAAECggEASUdssLacdoDZuLPwBCPzvoC9VTlErmRhjBt2MDwyk/BV\nKr5AlCdEyblpyOlfMQijSuw7rM38zUrzM4n1UKUMAm9W2DSYCH039KOOfDD46k90\ny51PsmehzdRZXTm7YOBaJNmETc8XgjKhFstbkov4oiteSkOEqvEHFKGSyG9/10XJ\nGILsFlkPvX06hQbKle8d0y2cBjtDFEEk1uNwZnRkdO01ODD0c4t9D01KzEo939/u\n2nRRIY51lPcQ0DldY8jVTzZ8Znz4uoL0UNgVcr4wiNDh77ztGsnRXJTb/2CL3P27\nbTzqKYLYgnT9I9jHjsJx8Yjv8MBme6SdtjUsZswrkQKBgQDxFajtgALet3ALwe8e\nmRtOMdL8mnzPTLnXx8u6LjFN73+rPwE7j3hzQmezdPEzQXHcU+09AuxR7UG80MBY\nXpgIYPTMp6mFESooJ8ZOYHKOQE1cpAEesh305drjPE/2SsCkU0cOIQPgWSlrqBjJ\n3zzNJOgOjIl3C2toG9LTChhS8QKBgQDfGDDpZqTRwQSuR0SY9P8Qxv+xbaB9qj2b\n9PMbvNkD4BkNGXUdlkIIKEARK04eZ7m7zzPJMwO1FnXT1Wc9ij+7/Lb6YR91f4Sz\nbStu31+PH6pKDt1+JMc8J+sHZGxOYyaEPVXvkxiYXhG4yP683e3Kvha30+j6p9ss\n1gtzMRdm9wKBgDx1NRbSOmYF1IhuSvv+Y1WZsxJ7337Q++38AcAf42dq/zY/p5x7\nHzawWXcshWxYJiidt2nMeN0WxZyHMSU4G6JGRj2och+XrV3Ck72F/FRmFcB8tHcx\nLcgDeH/x2Q+nsWXEKJaHewRg970yu3ysif/cGIHFhpee+oFyMM2Rw4XRAoGBAL7K\nInJI3OWhS4571nd09nlzphIn7dvqbnvktM/g5jsBOItSXS0rZlcxjPDh9xHbpSSv\no9sKbL4+cg/ybjNb+vuauSVRUCUdI/CKiV1tXHy7GNfy9Is/ir+wZ7hPsqwq8TKg\nfdDAHIWZ1VARXIFKzmTXwff+Gz3ZtYAXoX0m25urAoGAEpwIUC/Ruh/XJQ3L8EAl\nSgrExYyipUvizZ0EWxE+IBLt2tSN5uW4COhtGxrgkbYb0qusmu+cYSCPMpy6RD8f\nDjAVzwj+fq2DlIC8mP37MU7i6BPw5PlZBMIDlotiMQe3v6mNcLPg6cLC6GFu5aRp\nY3tMMzPiGeIggTagZ1hcvJ4=\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
  } as admin.ServiceAccount;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
  } else {
    firebaseInitialized = true;
  }
} catch (error: any) {
  console.error("[FIREBASE] CRITICAL ERROR initializing Firebase:", error);
  console.error("[FIREBASE] Error message:", error?.message);
  console.error("[FIREBASE] Error stack:", error?.stack);
  firebaseInitialized = false;
}

if (!firebaseInitialized) {
  throw new Error("Firebase n'a pas pu être initialisé. Vérifiez les credentials.");
}

export const db = admin.firestore();
export const auth = admin.auth();

