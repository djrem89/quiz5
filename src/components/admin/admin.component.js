import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service.js';
import '../../models/quiz.model.js'; // Keep import for module resolution, even if file is empty

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  quizService = inject(QuizService);
  imageClicked = output();
  
  allQuestions = this.quizService.questions;
  categories = this.quizService.categories;
  
  adminCategoryFilter = signal('all');
  searchTerm = signal('');

  filteredQuestions = computed(() => {
    const categoryFilter = this.adminCategoryFilter();
    const search = this.searchTerm().toLowerCase().trim();
    const all = this.allQuestions().map((q, index) => ({ ...q, originalIndex: index }));

    // Applica prima il filtro per categoria
    const categoryFiltered = categoryFilter === 'all'
      ? all
      : all.filter(q => q.category === categoryFilter);

    // Poi applica il filtro di ricerca
    if (!search) {
      return categoryFiltered;
    }

    return categoryFiltered.filter(q => {
      const inQuestionText = q.questionText.toLowerCase().includes(search);
      const inOptions = q.options.some(opt => opt.text.toLowerCase().includes(search));
      return inQuestionText || inOptions;
    });
  });

  // `index` traccia se si tratta di una modifica o di una nuova domanda
  editingQuestion = signal(null);

  startAdd() {
    const currentFilter = this.adminCategoryFilter();
    this.editingQuestion.set({
      questionText: '',
      imageUrl: '',
      options: [
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' },
      ],
      correctAnswerIndex: 0,
      category: currentFilter !== 'all' ? currentFilter : ''
    });
  }

  startEdit(question, index) {
    // Copia profonda per evitare di modificare direttamente il segnale originale
    this.editingQuestion.set({ 
        ...JSON.parse(JSON.stringify(question)), 
        index: index 
    });
  }

  cancelEdit() {
    this.editingQuestion.set(null);
  }

  updateQuestionText(event) {
    const target = event.target;
    this.editingQuestion.update(q => q ? { ...q, questionText: target.value } : null);
  }

  updateQuestionImageUrl(event) {
    const target = event.target;
    this.editingQuestion.update(q => q ? { ...q, imageUrl: target.value } : null);
  }
  
  updateCategory(event) {
    const target = event.target;
    this.editingQuestion.update(q => q ? { ...q, category: target.value } : null);
  }
  
  updateOptionText(index, event) {
    const target = event.target;
    this.editingQuestion.update(q => {
      if (!q || !q.options) return null;
      const newOptions = JSON.parse(JSON.stringify(q.options));
      newOptions[index].text = target.value;
      return { ...q, options: newOptions };
    });
  }

  updateOptionImageUrl(index, event) {
    const target = event.target;
    this.editingQuestion.update(q => {
      if (!q || !q.options) return null;
      const newOptions = JSON.parse(JSON.stringify(q.options));
      newOptions[index].imageUrl = target.value;
      return { ...q, options: newOptions };
    });
  }

  setCorrectAnswer(index) {
    this.editingQuestion.update(q => q ? { ...q, correctAnswerIndex: index } : null);
  }

  async saveQuestion() {
    const formState = this.editingQuestion();
    if (!formState) return;

    // Validazione dei dati del form
    if (
      !formState.questionText?.trim() ||
      !formState.category?.trim() ||
      !formState.options ||
      formState.options.length !== 4 ||
      formState.options.some(opt => !opt?.text?.trim()) ||
      formState.correctAnswerIndex === undefined ||
      formState.correctAnswerIndex < 0 ||
      formState.correctAnswerIndex > 3
    ) {
      alert('Per favore, compila tutti i campi correttamente prima di salvare.');
      return;
    }

    const questionToSave = {
      questionText: formState.questionText.trim(),
      imageUrl: formState.imageUrl?.trim() || undefined,
      category: formState.category.trim(),
      options: formState.options.map(opt => ({
        text: opt.text.trim(),
        imageUrl: opt.imageUrl?.trim() || undefined,
      })),
      correctAnswerIndex: formState.correctAnswerIndex,
    };

    if (formState.index !== undefined) {
      // Aggiorna la domanda esistente
      await this.quizService.updateQuestion(questionToSave, formState.index);
    } else {
      // Aggiunge una nuova domanda
      await this.quizService.addQuestion(questionToSave);
    }

    this.cancelEdit(); // Nasconde il form e resetta lo stato
  }

  async deleteQuestion(index) {
    if (confirm('Sei sicuro di voler eliminare questa domanda?')) {
      await this.quizService.deleteQuestion(index);
    }
  }

  onFilterChange(event) {
    const select = event.target;
    this.adminCategoryFilter.set(select.value);
  }

  onSearchInput(event) {
    const target = event.target;
    this.searchTerm.set(target.value);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  goHome() {
    this.quizService.resetQuiz();
  }
}