import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, deleteDoc, collection, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PreferenciasService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  async guardarTest(respuestas: string[]) {
    const usuario = this.auth.currentUser;
    if (!usuario) return;

    const busqueda = respuestas[0] + ' ' + respuestas[1] + ' curso';

    const ref = doc(this.firestore, `usuarios/${usuario.uid}`);
    await setDoc(ref, { test: respuestas, busqueda }, { merge: true });
  }

  async obtenerBusqueda(): Promise<string> {
    const usuario = this.auth.currentUser;
    if (!usuario) return '';

    const ref = doc(this.firestore, `usuarios/${usuario.uid}`);
    const snap = await getDoc(ref);
    const datos = snap.data();

    return datos && datos['busqueda'] ? datos['busqueda'] : '';
  }

  async guardarCurso(curso: any) {
    const usuario = this.auth.currentUser;
    if (!usuario) return;

    const ref = doc(this.firestore, `usuarios/${usuario.uid}/misCursos/${curso.videoId}`);
    await setDoc(ref, curso);
  }

  async quitarCurso(videoId: string) {
    const usuario = this.auth.currentUser;
    if (!usuario) return;

    const ref = doc(this.firestore, `usuarios/${usuario.uid}/misCursos/${videoId}`);
    await deleteDoc(ref);
  }

  async obtenerMisCursos(): Promise<any[]> {
    const usuario = this.auth.currentUser;
    if (!usuario) return [];

    const ref = collection(this.firestore, `usuarios/${usuario.uid}/misCursos`);
    const resultado = await getDocs(ref);

    return resultado.docs.map((documento) => documento.data());
  }
}
