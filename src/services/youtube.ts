import { Injectable } from '@angular/core';
import { environment } from '../app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  async buscarVideos(busqueda: string): Promise<any[]> {
    const url =
      'https://www.googleapis.com/youtube/v3/search' +
      '?part=snippet' +
      '&type=video' +
      '&maxResults=12' +
      '&relevanceLanguage=es' +
      '&q=' + encodeURIComponent(busqueda) +
      '&key=' + environment.youtubeApiKey;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error('YouTube respondió con error ' + respuesta.status);
    }

    const datos = await respuesta.json();

    return datos.items.map((item: any) => ({
      videoId: item.id.videoId,
      titulo: item.snippet.title,
      canal: item.snippet.channelTitle,
      imagen: item.snippet.thumbnails.medium.url,
    }));
  }
}
