import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { User, getAuth } from '@angular/fire/auth';
import { filter } from 'rxjs/operators';
import { PreferenciasService } from '../../../services/preferencias';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);
  private preferencias = inject(PreferenciasService);
  private cdr = inject(ChangeDetectorRef);

  public menuAbierto: boolean = false;
  public usuario: User | null = getAuth().currentUser;
  public subiendoFoto: boolean = false;
  public vistaActiva: 'perfil' | 'configuracion' = 'perfil';
  public nuevoNombre: string = '';
  public guardandoNombre: boolean = false;

  public cargandoEstadisticas: boolean = false;
  public estadisticas = {
    cursosGuardados: 0,
    playlistsCompletadas: 0,
    ratioCompletado: 0,
    categoriasConsultadas: 0,
    horasAprendizaje: 0,
    progresoGeneral: 0,
    metaSemanal: 0,
    metaMensual: 0
  };

  ngOnInit(): void {
    this.verificarRutaActual(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.verificarRutaActual(event.urlAfterRedirects || event.url);
    });

    this.authService.usuario$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        this.nuevoNombre = user.displayName || '';
        this.cargarDatosPerfil();
      } else if (!this.usuario) {
        this.router.navigate(['/']);
      }
    });
  }

  async cargarDatosPerfil(): Promise<void> {
    this.cargandoEstadisticas = true;
    try {
      const misCursos = await this.preferencias.obtenerMisCursos();
      
      this.estadisticas.cursosGuardados = misCursos ? misCursos.length : 0;
      
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      this.estadisticas.cursosGuardados = 0;
    } finally {
      this.cargandoEstadisticas = false;
      this.cdr.detectChanges();
    }
  }

  private verificarRutaActual(url: string): void {
    if (url.includes('configuracion')) {
      this.vistaActiva = 'configuracion';
      if (this.usuario) {
        this.nuevoNombre = this.usuario.displayName || '';
      }
    } else {
      this.vistaActiva = 'perfil';
    }
    this.menuAbierto = false;
  }

  cambiarVista(vista: 'perfil' | 'configuracion'): void {
    this.vistaActiva = vista;
    this.menuAbierto = false;
    this.router.navigate([`/${vista}`]);

    if (vista === 'configuracion' && this.usuario) {
      this.nuevoNombre = this.usuario.displayName || '';
    }
  }

  async guardarNombre(): Promise<void> {
    if (!this.usuario || !this.nuevoNombre.trim()) return;

    try {
      this.guardandoNombre = true;
      await this.authService.actualizarNombre(this.usuario, this.nuevoNombre.trim());
      this.usuario = { ...this.usuario, displayName: this.nuevoNombre.trim() } as User;
      alert('¡Nombre actualizado con éxito!');
    } catch (error) {
      alert('Hubo un error al actualizar el nombre. Inténtalo de nuevo.');
    } finally {
      this.guardandoNombre = false;
    }
  }

  async eliminarMiCuenta(): Promise<void> {
    if (!this.usuario) return;

    const confirmacion = confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta de forma permanente? Esta acción no se puede deshacer.'
    );

    if (confirmacion) {
      try {
        await this.authService.eliminarCuenta(this.usuario);
        alert('Tu cuenta ha sido eliminada.');
        this.router.navigate(['/']);
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          alert('Por seguridad, debes cerrar sesión y volver a iniciarla antes de eliminar tu cuenta.');
        } else {
          alert('Ocurrió un error al eliminar la cuenta.');
        }
      }
    }
  }

  async onArchivoSeleccionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.usuario) {
      const archivo = input.files[0];
      if (archivo.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Por favor elige una menor a 5 MB.');
        return;
      }
      try {
        this.subiendoFoto = true;
        const nuevaUrl = await this.authService.actualizarFotoPerfil(archivo, this.usuario);
        if (this.usuario) {
          this.usuario = { ...this.usuario, photoURL: nuevaUrl } as User;
        }
      } catch (error) {
        alert('Hubo un error al guardar la imagen. Inténtalo de nuevo.');
      } finally {
        this.subiendoFoto = false;
      }
    }
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}