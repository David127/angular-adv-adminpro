import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { FileUploadService } from 'src/app/services/file-upload.service';
import { UsuarioService } from 'src/app/services/usuario.service';

import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {

  perfilForm!: FormGroup;
  usuario: Usuario = {
    nombre: '',
    email: '',
    imagenUrl: ''
  }
  imagenSubir: File | null = null;
  imgTemp: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private fileUploadService: FileUploadService
  ) {
    this.usuario = usuarioService.usuario;
  }

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      nombre: [this.usuario.nombre, Validators.required],
      email: [this.usuario.email, [Validators.required, Validators.email]],
    });
  }

  actualizarPerfil(): void {
    console.log(this.perfilForm.value);
    this.usuarioService.actualizarPerfil(this.perfilForm.value)
    .subscribe(() => {
      const { nombre, email } = this.perfilForm.value;
      this.usuario.nombre = nombre;
      this.usuario.email = email;

      Swal.fire('Guardado', 'Cambios fueron guardados', 'success');
    }, (err) => {
      Swal.fire('Error', err.error.msg, 'error');
    });
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
      console.log(reader.result);
    }
  }

  subirImagen(): void {
    if (!this.imagenSubir || !this.usuario.uid) {
      return;
    }

    this.fileUploadService
    .actualizarFoto(this.imagenSubir, 'usuarios', this.usuario.uid)
    .then(img => {
      Swal.fire('Guardado', 'Imagen de usuario actualizada', 'success');
      this.usuario.img = img;
    }).catch(err => {
      Swal.fire('Guardado', 'No se pudo subir la imagen', 'success');
      console.log(err);
    });
  }

}
