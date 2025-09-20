// import { initializeApp } from "firebase/app";
// import { 
//   getAuth, 
//   GoogleAuthProvider, 
//   signInWithPopup, 
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   updateProfile
// } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

// // Debug: Log environment variables (remove in production)
// console.log('Firebase Config Check:', {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
//   appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Present' : 'Missing',
//   envMode: import.meta.env.MODE,
//   // Log actual values for debugging (remove in production)
//   actualValues: {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID
//   }
// });

// // Validate configuration with more detailed error messages
// const validateConfig = () => {
//   const errors: string[] = [];
  
//   if (!import.meta.env.VITE_FIREBASE_API_KEY) {
//     errors.push('VITE_FIREBASE_API_KEY is missing or empty');
//   }
//   if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
//     errors.push('VITE_FIREBASE_PROJECT_ID is missing or empty');
//   }
//   if (!import.meta.env.VITE_FIREBASE_APP_ID) {
//     errors.push('VITE_FIREBASE_APP_ID is missing or empty');
//   }
  
//   // Check for common issues
//   if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY === 'your-api-key') {
//     errors.push('VITE_FIREBASE_API_KEY appears to be a placeholder value');
//   }
  
//   if (errors.length > 0) {
//     console.error('Firebase configuration errors:', errors);
//     throw new Error(`Firebase configuration invalid: ${errors.join(', ')}`);
//   }
// };

// // Validate before attempting initialization
// validateConfig();

// let app: any;
// let auth: any;
// let db: any;

// try {
//   console.log('Attempting to initialize Firebase with config:', {
//     ...firebaseConfig,
//     apiKey: firebaseConfig.apiKey ? '[REDACTED]' : 'MISSING'
//   });
  
//   app = initializeApp(firebaseConfig);
//   auth = getAuth(app);
//   db = getFirestore(app);
//   console.log('✅ Firebase initialized successfully');
// } catch (error) {
//   console.error('❌ Failed to initialize Firebase:', error);
  
//   // More specific error handling
//   if (error instanceof Error) {
//     if (error.message.includes('API key not valid')) {
//       console.error('The API key is invalid. Please check your Firebase console.');
//     } else if (error.message.includes('Project ID')) {
//       console.error('The project ID is invalid. Please check your Firebase project settings.');
//     }
//   }
  
//   throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
// }

// export { auth, db };

// const provider = new GoogleAuthProvider();
// provider.addScope('email');
// provider.addScope('profile');

// export const signInWithGoogle = () => {
//   return signInWithPopup(auth, provider);
// };

// export const signInWithEmail = (email: string, password: string) => {
//   return signInWithEmailAndPassword(auth, email, password);
// };

// export const signUpWithEmail = async (email: string, password: string, name: string) => {
//   const result = await createUserWithEmailAndPassword(auth, email, password);
//   await updateProfile(result.user, { displayName: name });
//   return result;
// };

// export const logout = () => {
//   return signOut(auth);
// };