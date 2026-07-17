import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferenciasService } from '../../../../services/preferencias';
import { YoutubeService } from '../../../../services/youtube';

@Component({
  selector: 'app-cursos',
  imports: [RouterLink],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss',
})
export class Cursos implements OnInit {
  private preferencias = inject(PreferenciasService);
  private youtube = inject(YoutubeService);
  private cdr = inject(ChangeDetectorRef);

  cargando = true;
  sinTest = false;
  mensajeError = '';
  cursos: any[] = [];
  guardados: string[] = [];

  async ngOnInit() {
    try {
      const busqueda = await this.preferencias.obtenerBusqueda();

      if (!busqueda) {
        this.sinTest = true;
        return;
      }

      this.cursos = await this.youtube.buscarVideos(busqueda);

      const misCursos = await this.preferencias.obtenerMisCursos();
      this.guardados = misCursos.map((curso) => curso.videoId);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      this.mensajeError = 'No se pudieron cargar los videos. Revisa la API key de YouTube.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  yaGuardado(videoId: string) {
    return this.guardados.includes(videoId);
  }

  async guardar(curso: any) {
    if (this.yaGuardado(curso.videoId)) return;

    await this.preferencias.guardarCurso(curso);
    this.guardados.push(curso.videoId);
    this.cdr.detectChanges();
  }
}
