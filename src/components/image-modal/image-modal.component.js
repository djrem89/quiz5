import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export class ImageModalComponent {
  imageUrl = input.required();
  close = output();

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event) {
    // Chiude solo se si clicca sullo sfondo e non sull'immagine stessa
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}

Component({
  selector: 'app-image-modal',
  imports: [CommonModule],
  templateUrl: './src/components/image-modal/image-modal.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in-fast {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})(ImageModalComponent);