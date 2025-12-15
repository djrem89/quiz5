import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-modal',
  imports: [CommonModule],
  templateUrl: './image-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageModalComponent {
  imageUrl = input.required<string>();
  close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Chiude solo se si clicca sullo sfondo e non sull'immagine stessa
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
