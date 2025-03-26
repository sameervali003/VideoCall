// hooks/useAuth.js
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const useAuthHook = () => {
  const login = async (email, password) => {
    try {
      // Reference to the users collection
      const usersRef = collection(db, 'data');
      
      // Query to find the user with the provided email and password
      const q = query(usersRef, where('email', '==', email), where('password', '==', password));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid email or password');
      }

      // Assuming there's only one user with these credentials
      const userDoc = querySnapshot.docs[0].data();
      
      return userDoc;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return { login };
};
