import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { PreferenciasService } from '../../../services/preferencias';

@Component({
  selector: 'app-test',
  imports: [RouterLink],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test {
  private auth = inject(Auth);
  private router = inject(Router);
  private preferencias = inject(PreferenciasService);

  preguntaActual = 0;

  preguntas = [
    {
      texto: '¿Qué te interesa aprender?',
      opciones: ['Programación', 'Diseño', 'Negocios', 'Marketing', 'Idiomas'],
    },
    {
      texto: '¿Cuál es tu nivel?',
      opciones: ['Principiante', 'Intermedio', 'Avanzado'],
    },
    {
      texto: '¿Cuál es tu objetivo?',
      opciones: [
        'Aprender desde cero',
        'Mejorar habilidades',
        'Prepararme para un proyecto',
        'Explorar un tema nuevo',
      ],
    },
    {
      texto: '¿Qué tipo de contenido prefieres?',
      opciones: [
        'Videos cortos',
        'Cursos completos',
        'Listas de reproducción',
        'Una mezcla de todo',
      ],
    },
  ];

  respuestas: string[] = [];

  get logeado() {
    return !!this.auth.currentUser;
  }

  async elegir(opcion: string) {
    this.respuestas[this.preguntaActual] = opcion;

    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual = this.preguntaActual + 1;
      return;
    }

    if (this.logeado) {
      await this.preferencias.guardarTest(this.respuestas);
      this.router.navigate(['/panel/dashboard']);
    }
  }

  get terminado() {
    return this.respuestas.filter((r) => r).length === 4;
  }
}
