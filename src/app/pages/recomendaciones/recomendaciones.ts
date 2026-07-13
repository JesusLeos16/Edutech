import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-recomendaciones',
  imports: [RouterLink],
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.scss',
})
export class Recomendaciones {
  categoria = '';

  constructor() {
    const ruta = inject(ActivatedRoute);
    ruta.queryParamMap.subscribe((params) => {
      this.categoria = params.get('categoria') || '';
    });
  }
}
