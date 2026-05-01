import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { LogIn } from './Components/log-in/log-in';
import { CreateAccount } from './Components/create-account/create-account';
import { UserDashboard } from './Components/user-dashboard/user-dashboard';
import { BrowseTrees } from './Components/browse-trees/browse-trees';
import { TreeDisplay } from './Components/tree-display/tree-display';
import { TreeCreator } from './Components/tree-creator/tree-creator';
import { authGuard } from './guards/auth-guard';
import { TreeEditor } from './Components/tree-editor/tree-editor';

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: 'login', component: LogIn, title: 'Log In' },
  { path: 'create-account', component: CreateAccount, title: 'Create Account' },
  {
    path: 'dashboard',
    component: UserDashboard,
    title: 'User Dashboard',
    canActivate: [authGuard],
  },
  { path: 'browse-trees', component: BrowseTrees, title: 'Browse Trees', canActivate: [authGuard] },
  { path: 'tree/:id', component: TreeDisplay, title: 'Tree Display', canActivate: [authGuard] },
  { path: 'create-tree', component: TreeCreator, title: 'Create Tree', canActivate: [authGuard] },
  {
    path: 'edit-tree/:id',
    component: TreeEditor,
    title: 'Edit Tree',
    canActivate: [authGuard],
  },
];
