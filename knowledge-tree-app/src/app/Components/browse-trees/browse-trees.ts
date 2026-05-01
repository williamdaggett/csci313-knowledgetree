import { Component, computed, inject, signal } from '@angular/core';
import { TreeListItem } from '../tree-list-item/tree-list-item';
import { TreeDescription } from '../../models/tree-description';
import { TreeAPI } from '../../Services/tree-api';
import { FormsModule } from '@angular/forms';
import { or } from 'firebase/firestore';

@Component({
  selector: 'app-browse-trees',
  imports: [TreeListItem, FormsModule],
  templateUrl: './browse-trees.html',
  styleUrl: './browse-trees.css',
})
export class BrowseTrees {
  treeAPI = inject(TreeAPI);

  trees = signal<TreeDescription[]>([]);

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
    return Math.ceil(this.trees().length / 10);
  });

  constructor() {
    this.treeAPI
      .getAll()
      .pipe()
      .subscribe((trees) => {
        this.trees.set(trees);
        //this.updatePage();
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
}
