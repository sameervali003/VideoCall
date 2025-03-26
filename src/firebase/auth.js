// src/firebase/auth.js
import { auth } from "./firebase"; // Ensure the path is correct
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
