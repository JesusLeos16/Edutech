import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  public usuario$ = user(this.auth);

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  async existeNombreUsuario(nombre: string): Promise<boolean> {
    const nombreLimpio = nombre.trim();
    const usuariosRef = collection(this.firestore, 'usuarios');
    const consulta = query(usuariosRef, where('nombre', '==', nombreLimpio));
    const resultado = await getDocs(consulta);
    
    return !resultado.empty;
  }

  async loginConGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credencial = await signInWithPopup(this.auth, provider);
      const usuario = credencial.user;

      const datosUsuario = {
        uid: usuario.uid,
        nombre: usuario.displayName || 'Usuario Edutech',
        email: usuario.email,
        foto: usuario.photoURL || '',
        uiltimoAcceso: new Date().toISOString()
      };

      const refDocumento = doc(this.firestore, `usuarios/${usuario.uid}`);
      
      await setDoc(refDocumento, datosUsuario, { merge: true });

      return usuario;
    } catch (error) {
      console.error('Error durante el inicio de sesión con Google:', error);
      throw error;
    }
  }

async registroConEmail(nombre: string, email: string, password: string) {
    try {
      const nombreLimpio = nombre.trim();
      const emailLimpio = email.trim();
      const credencial = await createUserWithEmailAndPassword(this.auth, emailLimpio, password);
      const usuario = credencial.user;

      await updateProfile(usuario, { displayName: nombreLimpio });

      const datosUsuario = {
        uid: usuario.uid,
        nombre: nombreLimpio,
        email: usuario.email,
        foto: '', 
        uiltimoAcceso: new Date().toISOString()
      };

      const refDocumento = doc(this.firestore, `usuarios/${usuario.uid}`);
      await setDoc(refDocumento, datosUsuario, { merge: true });

      return usuario;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  async loginConEmail(email: string, password: string) {
    try {
      const credencial = await signInWithEmailAndPassword(this.auth, email, password);
      const usuario = credencial.user;
      const refDocumento = doc(this.firestore, `usuarios/${usuario.uid}`);
      await setDoc(refDocumento, { uiltimoAcceso: new Date().toISOString() }, { merge: true });

      return usuario;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }
}