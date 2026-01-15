import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Task = {
  _id: string;
  title: string;
  done: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'BrilliantTasks';
  tasks: Task[] = [];
  newTitle = '';
  loading = false;
  error = '';

  constructor() {
    this.loadTasks();
  }

  async loadTasks() {
    this.loading = true;
    this.error = '';
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(await res.text());
      this.tasks = await res.json();
    } catch {
      this.error = 'Nie udało się pobrać zadań (API jeszcze może nie działać).';
    } finally {
      this.loading = false;
    }
  }

  async addTask() {
    const title = this.newTitle.trim();
    if (!title) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(await res.text());
      this.newTitle = '';
      await this.loadTasks();
    } catch {
      this.error = 'Nie udało się dodać zadania.';
    }
  }

  async toggle(t: Task) {
    try {
      const res = await fetch(`/api/tasks/${t._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !t.done }),
      });
      if (!res.ok) throw new Error(await res.text());
      await this.loadTasks();
    } catch {
      this.error = 'Nie udało się zmienić statusu.';
    }
  }

  async remove(t: Task) {
    try {
      const res = await fetch(`/api/tasks/${t._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      await this.loadTasks();
    } catch {
      this.error = 'Nie udało się usunąć zadania.';
    }
  }
}
