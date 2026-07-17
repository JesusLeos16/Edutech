import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-panel',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public usuarioLogeado: any = null;
  public menuAbierto = false;

  ngOnInit() {
    this.authService.usuario$.subscribe((usuario: any) => {
      this.usuarioLogeado = usuario;
      this.cdr.detectChanges();
    });
  }

  alternarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarSesion() {
    this.authService
      .logout()
      .then(() => {
        this.menuAbierto = false;
        this.router.navigateByUrl('/');
      })
      .catch((error) => console.error('Error al salir:', error));
  }

  get nombreUsuario(): string {
    if (!this.usuarioLogeado) {
      return 'Usuario';
    }
    return this.usuarioLogeado.displayName || 'Usuario';
  }

  get inicialUsuario(): string {
    return this.nombreUsuario.charAt(0).toUpperCase();
  }
}
