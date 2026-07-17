import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  anio = new Date().getFullYear();
  public modalLoginVisible = false;
  public modalRegistroVisible = false;
  public emailLogin: string = '';
  public passwordLogin: string = '';
  public nombreRegistro: string = '';
  public emailRegistro: string = '';
  public passwordRegistro: string = '';
  public mensajeError: string = '';
  public usuarioLogeado: any = null;
  public menuUsuarioVisible: boolean = false;
  public seccionActiva: string = 'inicio';


  seleccionarSeccion(seccion: string): void {
    this.seccionActiva = seccion;

    const elemento = document.getElementById(seccion);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  constructor() {
    this.authService.usuario$.subscribe((usuario) => {
      this.usuarioLogeado = usuario;
      this.cdr.detectChanges();
    });
  }

  alternarMenuUsuario(): void {
    this.menuUsuarioVisible = !this.menuUsuarioVisible;
  }

  cerrarSesion(): void {
    this.authService.logout()
      .then(() => {
        console.log('Sesión cerrada exitosamente');
        this.menuUsuarioVisible = false;
        this.cdr.detectChanges();
      })
      .catch((error) => console.error('Error al salir:', error));
  }

  abrirModalLogin(): void {
    this.modalLoginVisible = true;
    this.modalRegistroVisible = false;
    this.mensajeError = '';
  }

  cerrarModalLogin(): void {
    this.modalLoginVisible = false;
  }

  abrirModalRegistro(): void {
    this.modalLoginVisible = true;
    this.modalRegistroVisible = true;
    this.mensajeError = '';
  }

  cerrarModalRegistro(): void {
    this.modalLoginVisible = false;
    this.modalRegistroVisible = false;
  }

  manejarLogin(): void {
    this.mensajeError = '';
    this.cdr.detectChanges();

    if (!this.emailLogin || !this.passwordLogin) {
      this.mensajeError = 'Por favor, ingresa tu correo y contraseña.';
      this.cdr.detectChanges();
      return;
    }

    this.authService.loginConEmail(this.emailLogin, this.passwordLogin)
      .then((usuario) => {
        console.log('¡Bienvenido de vuelta!', usuario.email);
        this.cerrarModalLogin();
        this.emailLogin = '';
        this.passwordLogin = '';
        this.router.navigate(['/panel/dashboard']);
      })
      .catch((error) => {
        console.error('Código de error Firebase:', error.code);

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          this.mensajeError = 'Correo o contraseña incorrectos. Verifica tus datos.';
          this.cdr.detectChanges();
        } else if (error.code === 'auth/invalid-email') {
          this.mensajeError = 'El formato del correo electrónico no es válido.';
          this.cdr.detectChanges();
        } else if (error.code === 'auth/too-many-requests') {
          this.mensajeError = 'Demasiados intentos fallidos. Inténtalo más tarde.';
          this.cdr.detectChanges();
        } else {
          this.mensajeError = 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.';
          this.cdr.detectChanges();
        }
      });
  }

  async manejarRegistro(): Promise<void> {
    this.mensajeError = '';
    this.cdr.detectChanges();

    if (!this.nombreRegistro || !this.emailRegistro || !this.passwordRegistro) {
      this.mensajeError = 'Por favor, llena todos los campos.';
      this.cdr.detectChanges();
      return;
    }

    if (this.passwordRegistro.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      this.cdr.detectChanges();
      return;
    }

    try {
      console.log('Verificando disponibilidad del nombre...');
      const nombreYaExiste = await this.authService.existeNombreUsuario(this.nombreRegistro);

      if (nombreYaExiste) {
        this.mensajeError = 'Este nombre de usuario ya está en uso. Por favor, elige otro.';
        this.cdr.detectChanges();
        return;
      }

      const usuario = await this.authService.registroConEmail(
        this.nombreRegistro,
        this.emailRegistro,
        this.passwordRegistro
      );

      console.log('¡Cuenta creada y guardada en BD!', usuario.displayName);
      this.cerrarModalRegistro();

      this.nombreRegistro = '';
      this.emailRegistro = '';
      this.passwordRegistro = '';

      this.router.navigate(['/panel/dashboard']);

    } catch (error: any) {
      console.error('Código de error Firebase:', error.code);

      if (error.code === 'auth/email-already-in-use') {
        this.mensajeError = 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
      } else if (error.code === 'auth/invalid-email') {
        this.mensajeError = 'El formato del correo electrónico no es válido.';
      } else {
        this.mensajeError = 'No se pudo crear la cuenta. Verifica tus datos.';
      }
      this.cdr.detectChanges();
    }
  }

  abrirModalRegistroDesdeLogin(): void {
    this.modalRegistroVisible = true;
    this.mensajeError = '';
  }

  abrirModalLoginDesdeRegistro(): void {
    this.modalRegistroVisible = false;
    this.mensajeError = '';
  }

  iniciarConGoogle(): void {
    this.mensajeError = '';
    this.cdr.detectChanges();
    this.authService.loginConGoogle()
      .then((usuario) => {
        console.log('¡Sesión iniciada con Google!', usuario.displayName);
        this.cerrarModalLogin();
        this.router.navigate(['/panel/dashboard']);
      })
      .catch((error) => {
        console.error('Error con Google:', error);
        this.mensajeError = 'No se pudo completar el inicio de sesión con Google.';
      });
  }
}