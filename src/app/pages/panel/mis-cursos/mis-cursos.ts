import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferenciasService } from '../../../../services/preferencias';

@Component({
  selector: 'app-mis-cursos',
  imports: [RouterLink],
  templateUrl: './mis-cursos.html',
  styleUrl: './mis-cursos.scss',
})
export class MisCursos implements OnInit {
  private preferencias = inject(PreferenciasService);
  private cdr = inject(ChangeDetectorRef);

  cargando = true;
  cursos: any[] = [];

  async ngOnInit() {
    this.cursos = await this.preferencias.obtenerMisCursos();
    this.cargando = false;
    this.cdr.detectChanges();
  }

  async quitar(curso: any) {
    await this.preferencias.quitarCurso(curso.videoId);
    this.cursos = this.cursos.filter((c) => c.videoId !== curso.videoId);
    this.cdr.detectChanges();
  }
}
