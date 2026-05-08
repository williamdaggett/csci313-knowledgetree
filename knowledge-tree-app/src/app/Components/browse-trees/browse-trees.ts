import { Component, computed, inject, signal, effect } from '@angular/core';
import { TreeDescription } from '../../models/tree-description';
import { TreeAPI } from '../../Services/tree-api';
import { FormsModule } from '@angular/forms';
import { or } from 'firebase/firestore';
import { AuthService } from '../../Services/authentication';
import { AppUser } from '../../models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse-trees',
  imports: [FormsModule],
  templateUrl: './browse-trees.html',
  styleUrl: './browse-trees.css',
})
export class BrowseTrees {
  authService = inject(AuthService);
  treeAPI = inject(TreeAPI);
  router = inject(Router);

  user = signal<AppUser | null>(null);

  trees = signal<TreeDescription[]>([]);

  loading = signal<Boolean>(false);

  authorNames = signal<string[]>([]);

  filteredTrees = computed<TreeDescription[]>(() => {
    if (this.filter() === '') {
      return this.trees();
    } else {
      return this.trees().filter((t) => {
        return (
          t.name.toLowerCase().includes(this.filter().toLowerCase()) ||
          t.description.toLowerCase().includes(this.filter().toLowerCase())
        );
      });
    }
  });

  filter = signal<string>('');

  items: string[] = [];
  paginatedTrees = computed<TreeDescription[]>(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredTrees().slice(start, start + this.itemsPerPage);
  });

  currentPage = signal<number>(1);
  visibleBase = signal<number>(1);
  visiblePages = signal<number[]>([]);
  itemsPerPage = 10;
  totalPages = computed<number>(() => {
    return Math.ceil(this.filteredTrees().length / 10);
  });

  constructor() {
    this.treeAPI
      .getPublished()
      .pipe()
      .subscribe((trees) => {
        this.trees.set(trees);
      });
    this.authService.user$.pipe().subscribe((u) => {
      this.user.set(u);
    });
    effect(async () => {
      const trees = this.paginatedTrees();
      this.authorNames.set([]);
      let nameList = [];
      for (const t of trees) {
        let author = await this.authService.getUserProfile(t.authorId);
        if (author) {
          nameList.push(author.name);
        } else {
          nameList.push('Unknown');
        }
      }
      this.authorNames.set(nameList);
    });
    effect(() => {
      const total = this.totalPages();
      this.visiblePages.set(this.getVisiblePages(this.visibleBase()));
    });
  }

  ngOnInit() {
    this.visiblePages.set(this.getVisiblePages(this.visibleBase()));
    //this.updatePage();
  }

  // updatePage() {
  //   const start = (this.currentPage() - 1) * this.itemsPerPage;
  //   this.paginatedTrees.set(this.filteredTrees().slice(start, start + this.itemsPerPage));
  // }

  goToPage(page: number) {
    this.currentPage.set(page);
    //this.updatePage();
  }

  getVisiblePages(base: number) {
    const total = this.totalPages();
    if (base > total - 4) {
      base = total - 4;
    }
    if (base < 1) {
      base = 1;
    }
    this.visibleBase.set(base);
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(base);
    pages.add(base + 1);
    pages.add(base + 2);
    pages.add(base + 3);
    pages.add(base + 4);
    return Array.from(pages).sort((a, b) => a - b);
  }

  adjustPages(step: number) {
    this.visiblePages.set(this.getVisiblePages(this.visibleBase() + step));
  }

  async learn(description: TreeDescription) {
    this.loading.set(true);
    let id = await this.treeAPI.createProgressTree(description, this.user()!.uid);
    this.router.navigate(['/tree', id]);
  }
}
