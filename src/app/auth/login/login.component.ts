import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {

  @ViewChild('googleBtn') googleBtn!: ElementRef;
  public formSubmitted = false;

  public loginForm = this.fb.nonNullable.group({
    email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
    password: ['123456', Validators.required],
    remember: [false]
  });

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    this.googleInit();
  }

  private googleInit(): void {
    google.accounts.id.initialize({
      client_id: "545841775769-8seeo34bnqvs5n4fuu4ciis3pc6kis6v.apps.googleusercontent.com",
      callback: (response: any) => this.handleCredentialResponse(response)
    });
    google.accounts.id.renderButton(
      // document.getElementById("buttonDiv"),
      this.googleBtn.nativeElement,
      { theme: "outline", size: "large" }  // customization attributes
    );
  }

  handleCredentialResponse(response: any) {
    // console.log("Encoded JWT ID token: " + response.credential);
    this.usuarioService.loginGoogle(response.credential)
    .subscribe(resp => {
      // console.log('Login:', resp)
      this.router.navigateByUrl('/');
    })
  }

  login() {
    this.usuarioService.login(this.loginForm.value)
    .subscribe(resp => {

      if (this.loginForm.get('remember')?.value) {
        localStorage.setItem('email', this.loginForm.get('email')?.value!);
      } else {
        localStorage.removeItem('email');
      }

      // Navegar al Dashboard
      this.ngZone.run(() => {
        this.router.navigateByUrl('/');
      });
      
    }, (err) => {
      // Si sucede un error
      Swal.fire('Error', err.error.msg, 'error');
    });
  }
}
