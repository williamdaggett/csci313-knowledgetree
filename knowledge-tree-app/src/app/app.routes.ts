import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { LogIn } from './Components/log-in/log-in';
import { CreateAccount } from './Components/create-account/create-account';
import { UserDashboard } from './Components/user-dashboard/user-dashboard';
import { BrowseTrees } from './Components/browse-trees/browse-trees';
import { TreeDisplay } from './Components/tree-display/tree-display';
import { TreeCreator } from './Components/tree-creator/tree-creator';

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: 'login', component: LogIn, title: 'Log In' },
  { path: 'create-account', component: CreateAccount, title: 'Create Account' },
  { path: 'dashboard', component: UserDashboard, title: 'User Dashboard' },
  { path: 'browse-trees', component: BrowseTrees, title: 'Browse Trees' },
  { path: 'tree/:id', component: TreeDisplay, title: 'Tree Display' },
  { path: 'create-tree', component: TreeCreator, title: 'Create Tree' },
];
