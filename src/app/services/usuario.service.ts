import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';

import { Usuario } from '../models/usuario.model';

declare const google: any;
declare const gapi: any;

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  auth2: any;
  usuario: Usuario = {
    nombre: '',
    email: '',
    imagenUrl: ''
  }

  constructor(private http: HttpClient,
              private router: Router
  ) {
    // this.googleInit();
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get uid(): string {
    return this.usuario.uid || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: '1045072534136-oqkjcjvo449uls0bttgvl3aejelh22f5.apps.google.com',
        cookiepolicy: 'single_host_origin'
      });
    })
  }

  logout() {
    localStorage.removeItem('token');
    google.accounts.id.revoke('david.vid727@gmail.com', () => {
      this.router.navigateByUrl('/login');
    });
    /*
    this.auth2.signOut().then(() => {
      this.router.navigateByUrl('/login');
    });
    */
  }

  validarToken(): Observable<boolean> {

    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': this.token
      }
    }).pipe(
      map((resp: any) => {
        const { email, google, nombre, role, img = '', uid } = resp.usuario;
        this.usuario = new Usuario(nombre, email, '', img, google, role, uid);
        
        localStorage.setItem('token', resp.token)
        return true;
      }),
      catchError(error => of(false))
    )
  }

  crearUsuario(formData: RegisterForm) {
    
    return this.http.post(`${base_url}/usuarios`, formData)
            .pipe(
              tap((resp: any) => {
                localStorage.setItem('token', resp.token)
              })
            )
  }

  actualizarPerfil(data: { email: string, nombre: string, role: string | undefined } ) {

    data = {
      ...data,
      role: this.usuario.role
    }

    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, {
      headers: {
        'x-token': this.token
      }
    })
  }

  login(formData: LoginForm) {
    
    return this.http.post(`${base_url}/login`, formData)
            .pipe(
              tap((resp: any) => {
                localStorage.setItem('token', resp.token)
              })
            )
  }

  loginGoogle(token: string) {
    return this.http.post(`${base_url}/login/google`, { token })
            .pipe(
              tap((resp: any) => {
                localStorage.setItem('token', resp.token)
              })
            )
  }

  cargarUsuarios(desde: number = 0) {

    const url = `${base_url}/usuarios?desde=${desde}`;
    return this.http.get<CargarUsuario>(url, this.headers)
            .pipe(
              map(resp => {
                const usuarios = resp.usuarios.map(
                  user => new Usuario(user.nombre, user.email, '', user.img, user.google, user.role, user.uid)
                );

                return {
                  total: resp.total,
                  usuarios
                }
              })
            )

  }

  eliminarUsuario(usuario: Usuario) {

    const url = `${base_url}/usuarios/${usuario.uid}`;
    return this.http.delete(url, this.headers)
  }

  guardarUsuario(usuario: Usuario ) {

    return this.http.put(`${base_url}/usuarios/${usuario.uid}`, usuario, this.headers);
  }
}
