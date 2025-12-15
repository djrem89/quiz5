import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  quizService = inject(QuizService);
  loginSuccess = output<void>();

  username = signal('');
  password = signal('');
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(false);

  onUsernameInput(event: Event) {
    this.username.set((event.target as HTMLInputElement).value);
  }
  
  onPasswordInput(event: Event) {
    this.password.set((event.target as HTMLInputElement).value);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  login(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // Simula una chiamata di rete per un'esperienza utente migliore
    setTimeout(() => {
        const success = this.authService.login(this.username(), this.password());
        if (success) {
            this.loginSuccess.emit();
        } else {
            this.errorMessage.set('Nome utente o password non validi.');
        }
        this.isLoading.set(false);
    }, 500);
  }

  goBack(): void {
    this.quizService.resetQuiz();
  }
}