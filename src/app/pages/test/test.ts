import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-test',
  imports: [RouterLink],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test {
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

  elegir(opcion: string) {
    this.respuestas[this.preguntaActual] = opcion;
    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual = this.preguntaActual + 1;
    }
  }

  get terminado() {
    return this.respuestas.filter((r) => r).length === 4;
  }
}
