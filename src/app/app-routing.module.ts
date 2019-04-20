import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: './delivery/delivery.module#DeliveryPageModule'
  },
  { 
    path: 'delivery', 
    loadChildren: './delivery/delivery.module#DeliveryPageModule'
  },
  { path: 'order-detail', loadChildren: './order-detail/order-detail.module#OrderDetailPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
