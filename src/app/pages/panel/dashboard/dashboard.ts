import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferenciasService } from '../../../../services/preferencias';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private preferencias = inject(PreferenciasService);
  private cdr = inject(ChangeDetectorRef);

  cargando = true;
  hizoTest = false;
  totalGuardados = 0;

  async ngOnInit() {
    const busqueda = await this.preferencias.obtenerBusqueda();
    this.hizoTest = busqueda !== '';

    const misCursos = await this.preferencias.obtenerMisCursos();
    this.totalGuardados = misCursos.length;

    this.cargando = false;
    this.cdr.detectChanges();
  }
}
