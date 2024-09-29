import { Component } from '@angular/core';
import Swal from 'sweetalert2';

import { FileUploadService } from 'src/app/services/file-upload.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';

@Component({
  selector: 'app-modal-imagen',
  templateUrl: './modal-imagen.component.html',
  styles: [
  ]
})
export class ModalImagenComponent {

  ocultarModal = false;

  imagenSubir: File | null = null;
  imgTemp: any;

  constructor(
    public modalImagenService: ModalImagenService,
    public fileUploadService: FileUploadService
  ) { }

  cerrarModal() {
    this.imgTemp = null;
    this.modalImagenService.cerrarModal();
  }

  cambiarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files as FileList;
    this.imagenSubir = files[0];

    if (!this.imagenSubir) {
      this.imgTemp = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.imagenSubir);

    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }
  }

  subirImagen(): void {

    if (!this.imagenSubir) {
      return;
    }
    
    const id = this.modalImagenService.id;
    const tipo = this.modalImagenService.tipo;

    this.fileUploadService
    .actualizarFoto(this.imagenSubir, tipo, id)
    .then(img => {
      Swal.fire('Guardado', 'Imagen de usuario actualizada', 'success');

      this.modalImagenService.nuevaImagen.emit(img);
      
      this.cerrarModal();
    }).catch(err => {
      console.log(err);
      Swal.fire('Guardado', 'No se pudo subir la imagen', 'success');
    });
  }

}
