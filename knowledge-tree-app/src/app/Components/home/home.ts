import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TreeCreator } from '../tree-creator/tree-creator';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TreeCreator],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
